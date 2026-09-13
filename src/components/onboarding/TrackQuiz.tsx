"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/courses";
import { GOALS, LEVELS, buildLearningPlan, type Answers, type Goal, type Experience } from "@/lib/onboarding";

export function TrackQuiz({ initialAnswers, onSave, onCancel }: {
  initialAnswers?: Answers;
  onSave: (answers: Answers) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | "">(initialAnswers?.goal ?? "");
  const [experience, setExperience] = useState<Experience | "">(initialAnswers?.experience ?? "");
  const [interest, setInterest] = useState(initialAnswers?.interest ?? "");
  const heading = useRef<HTMLHeadingElement>(null);
  const id = useId();
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus();
    previousStep.current = step;
  }, [step]);
  const optional = goal === "web" || goal === "data";
  const preview = step === 3;
  const answers = goal && experience ? { goal, experience, interest } : null;
  const courses = answers ? buildLearningPlan(answers) : [];
  const title = preview ? "Your suggested learning path" : ["What’s your primary goal?", "Where are you starting from?", "What interests you most?"][step];
  const options = step === 0 ? Object.entries(GOALS) : step === 1 ? Object.entries(LEVELS) : goal === "web" ? [["", "No preference"], ["ui", "UI and design"], ["infra", "Infrastructure and deployment"]] : [["", "No preference"], ["analysis", "Data analysis"], ["ml", "Machine learning"]];
  return (
    <section aria-labelledby={id} className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-widest text-primary-hover uppercase">{preview ? "Review your roadmap" : `Step ${step + 1}${step === 0 ? " · Your goal" : ` of ${optional ? 3 : 2}`}`}</p>
        <h3 ref={heading} tabIndex={-1} id={id} className="text-2xl">{title}</h3>
      </div>
      {!preview ? <>
        <fieldset className="grid min-w-0 gap-4 sm:grid-cols-2">
          <legend className="sr-only">{title}</legend>
          {options.map(([value, label]) => (
            <label key={value} className="flex min-h-16 min-w-0 cursor-pointer items-center gap-4 rounded-lg border p-4 has-checked:border-primary has-checked:bg-secondary hover:bg-muted">
              <input type="radio" name={`${id}-${step}`} value={value} checked={(step === 0 ? goal : step === 1 ? experience : interest) === value}
                onChange={() => {
                  if (step === 0) { setGoal(value as Goal); setInterest(""); }
                  else if (step === 1) setExperience(value as Experience);
                  else setInterest(value);
                }} className="size-4 shrink-0 accent-primary" />
              <span className="text-sm font-semibold">{label}</span>
            </label>
          ))}
        </fieldset>
        {step === 2 && <p className="text-sm text-muted-foreground">Optional. Your interests tailor the path, but do not replace prerequisites.</p>}
      </> : answers && <>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{GOALS[answers.goal]} · {LEVELS[answers.experience]}</p>
          <p>{courses.length} courses · {formatDuration(courses.reduce((sum, c) => sum + c.durationMinutes, 0))} of catalog content, ordered by foundations and prerequisites.</p>
          {answers.experience === "experienced" && ["web", "data"].includes(answers.goal) && <p>Beginner courses are omitted based on your experience. They remain available in the catalog.</p>}
          {answers.goal === "data" && answers.experience === "new" && <p>Machine Learning Fundamentals is a future step after the basics.</p>}
          {answers.goal === "product" && answers.experience !== "experienced" && <p>Leadership for Senior Engineers is suggested at the experienced level.</p>}
        </div>
        <ol className="space-y-4">{courses.map((course, index) => (
          <li key={course.id} className="flex gap-4 rounded-lg border p-4">
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm text-primary-hover">{index + 1}</span>
            <div className="min-w-0"><p className="font-semibold">{course.title}</p><p className="text-sm text-muted-foreground">{course.difficulty} · {formatDuration(course.durationMinutes)}</p></div>
          </li>
        ))}</ol>
        <p className="text-sm text-muted-foreground">Saving the same goal updates its track. Other tracks and your course progress stay unchanged.</p>
      </>}
      <div className="flex flex-wrap gap-4 border-t pt-4">
        {step > 0 && <Button variant="outline" onClick={() => setStep(preview ? optional ? 2 : 1 : step - 1)}>Back</Button>}
        {preview ? <Button disabled={!answers} onClick={() => { if (answers) onSave(answers); }}>Save to classroom</Button> : <Button disabled={step === 0 ? !goal : !experience} onClick={() => setStep(step === 0 ? 1 : step === 1 && optional ? 2 : 3)}>{step === 0 || (step === 1 && optional) ? "Next" : "Show my path"}</Button>}
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </section>
  );
}
