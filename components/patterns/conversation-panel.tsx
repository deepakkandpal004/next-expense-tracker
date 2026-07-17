"use client";

import { Bot, Database, MessageCircle, RefreshCw, Send } from "lucide-react";
import { useRef, useState } from "react";
import { generateInsightAnswerResult, type AnswerData, type AnswerRequest } from "@/app/actions/generateInsightAnswer";
import { Alert, Button, Card, DateText, Field, SectionHeader, StatusRegion } from "@/components/ui";
import type { ActionResult, AiConversationAnswer, AiDataUseDisclosure, ReportingPeriod } from "@/lib/domain/types";

const DISCLOSURE_SESSION_KEY = "expense-ai.ai-answer-disclosure";

type AnswerResult = ActionResult<AnswerData, "question" | "period" | "disclosure">;
type AnswerLoader = (request: AnswerRequest) => Promise<AnswerResult>;

export interface ConversationPanelProps {
  period: ReportingPeriod;
  disclosure: AiDataUseDisclosure;
  loadAnswer?: AnswerLoader;
}

const SUGGESTED_QUESTIONS = [
  "What was my largest spending category this period?",
  "How does my spending compare to my income this period?",
  "Which category grew the most compared to typical spending?",
] as const;

function hasReviewedDisclosure(version: string): boolean {
  try {
    return window.sessionStorage.getItem(DISCLOSURE_SESSION_KEY) === version;
  } catch {
    return false;
  }
}

function rememberDisclosure(version: string) {
  try {
    window.sessionStorage.setItem(DISCLOSURE_SESSION_KEY, version);
  } catch {
    // Session storage is a convenience only; the server still requires the disclosure version.
  }
}

function DisclosurePanel({ disclosure, onContinue }: { disclosure: AiDataUseDisclosure; onContinue: () => void }) {
  return (
    <section aria-labelledby="insights-disclosure-title" className="rounded-container border border-info-border bg-info-surface p-4">
      <div className="flex gap-3">
        <Database aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
        <div className="min-w-0">
          <h3 className="text-interface-md font-semibold" id="insights-disclosure-title">AI data-use disclosure</h3>
          <p className="mt-1 text-interface-sm">{disclosure.purpose}</p>
          <p className="mt-3 text-interface-sm font-semibold">Fields sent for generation</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-interface-sm">
            {disclosure.fields.map((field) => <li key={field}>{field}</li>)}
          </ul>
          <p className="mt-3 text-interface-sm">{disclosure.providerRetention.statement}</p>
          <Button className="mt-4" icon={<Bot size={18} />} intent="secondary" label="Continue and ask a question" onClick={onContinue} />
        </div>
      </div>
    </section>
  );
}

function AnswerCard({ answer }: { answer: AiConversationAnswer }) {
  return (
    <Card as="article" className="grid gap-4" elevation="raised">
      <div>
        <p className="text-interface-xs font-semibold uppercase tracking-wide text-foreground-secondary">Your question</p>
        <p className="mt-1 font-semibold text-foreground">{answer.question}</p>
      </div>
      <div className="rounded-container border border-info-border bg-info-surface p-4">
        <p className="text-interface-xs font-semibold uppercase tracking-wide">AI-generated answer</p>
        <p className="mt-2 text-interface-sm">{answer.answer}</p>
        {answer.stale ? <p className="mt-2 text-interface-xs font-semibold">This answer could not be refreshed and may be outdated.</p> : null}
      </div>
      {answer.facts.length > 0 ? (
        <section aria-labelledby="answer-facts-title" className="rounded-container border border-border bg-surface-subtle p-4">
          <h3 className="text-interface-sm font-semibold text-foreground" id="answer-facts-title">Recorded data facts</h3>
          <dl className="mt-2 grid gap-2 text-interface-sm">
            {answer.facts.map((fact) => (
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1" key={`${fact.label}-${fact.value}`}>
                <dt className="text-foreground-secondary">{fact.label}</dt>
                <dd className="financial-value font-semibold text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      <p className="text-interface-xs text-foreground-secondary">
        {answer.period.label} · Generated <DateText format="date-time" value={answer.generatedAt} />
      </p>
      <p className="text-interface-xs text-foreground-secondary">{answer.disclaimer}</p>
    </Card>
  );
}

export function ConversationPanel({ period, disclosure: initialDisclosure, loadAnswer = generateInsightAnswerResult }: ConversationPanelProps) {
  const [disclosure, setDisclosure] = useState(initialDisclosure);
  const [disclosureAccepted, setDisclosureAccepted] = useState(() => hasReviewedDisclosure(initialDisclosure.version));
  const [question, setQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<AiConversationAnswer | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const retryQuestionRef = useRef<string | null>(null);

  const ask = async (submittedQuestion: string) => {
    const trimmed = submittedQuestion.trim();
    if (!trimmed || pendingQuestion) return;
    setPendingQuestion(trimmed);
    setError(undefined);
    setStatus(undefined);
    retryQuestionRef.current = trimmed;
    try {
      const result = await loadAnswer({
        question: trimmed,
        period,
        disclosureVersion: disclosure.version,
        previousAnswer: answer,
      });
      if (result.status !== "success") {
        setError(result.message);
        return;
      }
      if (result.data.state === "disclosure-required") {
        setDisclosure(result.data.disclosure);
        setDisclosureAccepted(false);
        return;
      }
      setAnswer(result.data.answer);
      setQuestion("");
      setStatus("Answer is available.");
    } catch {
      setError("The answer could not be generated. Please retry.");
    } finally {
      setPendingQuestion(null);
    }
  };

  const acceptDisclosure = () => {
    rememberDisclosure(disclosure.version);
    setDisclosureAccepted(true);
    if (retryQuestionRef.current) void ask(retryQuestionRef.current);
  };

  const retry = () => {
    if (retryQuestionRef.current) void ask(retryQuestionRef.current);
  };

  return (
    <div className="grid gap-8">
      <header>
        <h1 className="text-display-md font-semibold text-foreground">Insights</h1>
        <p className="mt-1 text-interface-sm text-foreground-secondary">Reporting period: {period.kind === "custom" ? `${period.start} – ${period.end}` : period.kind.replace("-", " ")}</p>
      </header>

      {!disclosureAccepted ? <DisclosurePanel disclosure={disclosure} onContinue={acceptDisclosure} /> : null}

      <Card as="section" aria-labelledby="ask-question-title" elevation="raised">
        <SectionHeader description="Ask a question about your recorded transactions for this reporting period." title="Ask a question" headingLevel={2} />
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(event) => { event.preventDefault(); void ask(question); }}
        >
          <div className="min-w-0 flex-1">
            <Field
              disabled={Boolean(pendingQuestion)}
              id="insights-question"
              label="Question"
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="e.g. What did I spend the most on?"
              value={pendingQuestion ?? question}
            />
          </div>
          <Button icon={<Send size={18} />} label="Ask" loading={Boolean(pendingQuestion)} type="submit" />
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((suggestion) => (
            <Button
              disabled={Boolean(pendingQuestion)}
              icon={<MessageCircle size={16} />}
              intent="ghost"
              key={suggestion}
              label={`Ask: ${suggestion}`}
              onClick={() => setQuestion(suggestion)}
            />
          ))}
        </div>
      </Card>

      <StatusRegion busy={Boolean(pendingQuestion)} message={pendingQuestion ? "Generating your answer." : status} visible={Boolean(pendingQuestion || status)} />

      {error ? (
        <Alert
          action={<Button icon={<RefreshCw size={18} />} label="Retry question" onClick={retry} />}
          description={error}
          title="Answer could not be generated"
          tone="danger"
        />
      ) : null}

      {answer ? <AnswerCard answer={answer} /> : null}
    </div>
  );
}
