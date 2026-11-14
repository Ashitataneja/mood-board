import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { Character } from '../../characters/Character';
import { useCharacterWorld } from '../../characters/useMood';
import { contactCopy as copy } from '../../content/contact';
import { site } from '../../content/sections';
import type { MoodId } from '../../content/types';
import { useViewport } from '../../hooks/useViewport';
import styles from './Contact.module.css';

type Step = 'name' | 'topic' | 'email' | 'message' | 'sending' | 'sent' | 'failed';
const order: Step[] = ['name', 'topic', 'email', 'message'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TYPING_MS = 600;

interface Answers {
  name: string;
  topic: string;
  email: string;
  message: string;
}

interface Msg {
  id: string;
  from: 'cloud' | 'me';
  text: string;
}

function mailtoHref(a: Answers) {
  const subject = `Hello from ${a.name}${a.topic ? ` · ${a.topic}` : ''}`;
  const body = [a.message, '', `${a.name}`, a.email].filter((l) => l !== undefined).join('\n');
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function send(a: Answers): Promise<'sent' | 'mailto' | 'failed'> {
  if (!site.contactEndpoint) {
    window.location.href = mailtoHref(a);
    return 'mailto';
  }
  try {
    const res = await fetch(site.contactEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...a, _subject: `Portfolio: ${a.topic || 'hello'} from ${a.name}` }),
    });
    return res.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}

/**
 * The Contact cloud asks one question at a time. Under the hood it is a single
 * real <form>: the current question is the label of the current input, earlier
 * answers ride along as hidden fields, and Enter submits each step.
 */
export function Chat() {
  const { reduced } = useCharacterWorld();
  const vp = useViewport();
  const uid = useId().replace(/:/g, '');
  const [plain, setPlain] = useState(false);
  const [step, setStep] = useState<Step>('name');
  const [typing, setTyping] = useState(true);
  const [answers, setAnswers] = useState<Answers>({ name: '', topic: '', email: '', message: '' });
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [log, setLog] = useState<Msg[]>([]);
  const [mailto, setMailto] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const interacted = useRef(false);
  const cloud = useAnimationControls();

  const questionId = `${uid}-q`;
  const errorId = `${uid}-err`;

  const say = (text: string, from: Msg['from'] = 'cloud') =>
    setLog((l) => [...l, { id: `${l.length}-${from}`, from, text }]);

  // The cloud "types" before each question.
  const ask = (text: string) => {
    setTyping(true);
    window.setTimeout(
      () => {
        setTyping(false);
        say(text);
      },
      reduced ? 250 : TYPING_MS,
    );
  };

  // First question on arrival.
  useEffect(() => {
    const t = window.setTimeout(
      () => {
        setTyping(false);
        setLog([{ id: '0-cloud', from: 'cloud', text: copy.askName }]);
      },
      reduced ? 250 : TYPING_MS + 300,
    );
    return () => window.clearTimeout(t);
  }, [reduced]);

  // Keep the newest bubble in view, and hand focus to the new input once the visitor has started.
  useLayoutEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [log, typing, reduced]);
  useEffect(() => {
    if (!typing && interacted.current) inputRef.current?.focus({ preventScroll: true });
  }, [typing, step]);

  const advance = (value: string) => {
    interacted.current = true;
    setError('');
    if (step === 'name') {
      const name = value.trim();
      if (!name) return setError('Your name, please, so I know who I’m talking to.');
      setAnswers((a) => ({ ...a, name }));
      say(name, 'me');
      setDraft('');
      setStep('topic');
      ask(copy.askTopic(name));
    } else if (step === 'topic') {
      const topic = value.trim();
      if (!topic) return setError('Pick one of the options or type a topic.');
      setAnswers((a) => ({ ...a, topic }));
      say(topic, 'me');
      setDraft('');
      setStep('email');
      ask(copy.askEmail);
    } else if (step === 'email') {
      const email = value.trim();
      if (!EMAIL.test(email)) {
        setError(copy.badEmail);
        return;
      }
      setAnswers((a) => ({ ...a, email }));
      say(email, 'me');
      setDraft('');
      setStep('message');
      ask(copy.askMessage);
    } else if (step === 'message') {
      void finish({ ...answers, message: value.trim() });
    }
  };

  const finish = async (a: Answers, retry = false) => {
    setAnswers(a);
    if (a.message && !retry) say(a.message, 'me');
    setDraft('');
    setStep('sending');
    const result = await send(a);
    if (result === 'failed') {
      setStep('failed');
      ask(copy.failed);
      return;
    }
    setMailto(result === 'mailto');
    setStep('sent');
    ask(result === 'mailto' ? copy.sentMailto : copy.sent);
    if (!reduced) {
      // squash, then stretch up, then land
      await cloud.start({
        scaleX: [1, 1.14, 0.9, 1.04, 1],
        scaleY: [1, 0.82, 1.14, 0.97, 1],
        y: [0, 8, -70, 0, 0],
        transition: { duration: 0.85, times: [0, 0.18, 0.5, 0.82, 1], ease: 'easeOut' },
      });
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    advance(draft);
  };

  const mood: MoodId =
    step === 'failed' ? 'worried' : step === 'sent' ? 'grin' : typing ? 'curious' : 'grin';
  const small = vp.w < 1024;
  const cloudSize = small ? 110 : 280;
  const current = log.filter((m) => m.from === 'cloud').at(-1)?.text ?? copy.askName;

  if (plain) return <PlainForm onBack={() => setPlain(false)} />;

  return (
    <div className={styles.chat}>
      <motion.div
        className={styles.cloud}
        animate={cloud}
        style={{ originY: 1, width: cloudSize, height: cloudSize }}
        aria-hidden="true"
      >
        {/* ink outline: it sits on its own colour */}
        <Character
          id="contact"
          width={cloudSize}
          height={cloudSize}
          mood={mood}
          outline={small ? 3 : 5}
        />
      </motion.div>

      <div className={styles.thread}>
        <div
          ref={logRef}
          className={styles.log}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          <ol className={styles.logList}>
            <AnimatePresence initial={false}>
              {log.map((m, i) => (
                <motion.li
                  key={m.id}
                  className={m.from === 'cloud' ? styles.cloudMsg : styles.meMsg}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={
                    reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 420, damping: 30 }
                  }
                  id={i === log.length - 1 && m.from === 'cloud' ? questionId : undefined}
                >
                  <span className="visually-hidden">
                    {m.from === 'cloud' ? 'Cloud: ' : 'You: '}
                  </span>
                  {m.text}
                </motion.li>
              ))}
              {typing && (
                <motion.li
                  key="typing"
                  className={`${styles.cloudMsg} ${styles.typing}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  aria-label="The cloud is typing"
                >
                  <span />
                  <span />
                  <span />
                </motion.li>
              )}
            </AnimatePresence>
            {step === 'sent' && !typing && (
              <li className={styles.links}>
                <a href={`mailto:${site.email}`}>{site.email}</a>
                <a href={site.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <Link to="/resume">Résumé →</Link>
                {mailto && <a href={mailtoHref(answers)}>Open the email again</a>}
              </li>
            )}
            {step === 'failed' && !typing && (
              <li className={styles.links}>
                <a href={mailtoHref(answers)}>Email {site.email}</a>
                <button type="button" onClick={() => void finish(answers, true)}>
                  Try again
                </button>
              </li>
            )}
          </ol>
        </div>

        {order.includes(step) && (
          <form className={styles.composer} onSubmit={onSubmit} noValidate aria-busy={typing}>
            {/* earlier answers travel with the form */}
            {(['name', 'topic', 'email'] as const).map(
              (k) => answers[k] && <input key={k} type="hidden" name={k} value={answers[k]} />,
            )}
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              className={styles.honeypot}
              aria-hidden="true"
            />

            {step === 'topic' && (
              <div className={styles.chips} role="group" aria-label="Quick replies">
                {copy.topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={styles.chip}
                    disabled={typing}
                    onClick={() => advance(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.row}>
              <label htmlFor={`${uid}-in`} className="visually-hidden">
                {step === 'topic' ? `${current} Or type your own topic.` : current}
              </label>
              {step === 'message' ? (
                <textarea
                  ref={inputRef}
                  id={`${uid}-in`}
                  name="message"
                  rows={2}
                  className={styles.input}
                  placeholder="Optional. Anything you'd like to add."
                  value={draft}
                  disabled={typing}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      advance(draft);
                    }
                  }}
                />
              ) : (
                <input
                  ref={inputRef}
                  id={`${uid}-in`}
                  name={step}
                  type={step === 'email' ? 'email' : 'text'}
                  autoComplete={step === 'name' ? 'name' : step === 'email' ? 'email' : 'off'}
                  className={styles.input}
                  placeholder={
                    step === 'name'
                      ? 'Your name'
                      : step === 'email'
                        ? 'you@example.com'
                        : 'Or type a topic'
                  }
                  value={draft}
                  disabled={typing}
                  aria-invalid={!!error || undefined}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(e) => setDraft(e.target.value)}
                />
              )}
              <button type="submit" className={styles.send} disabled={typing}>
                {step === 'message' ? (draft.trim() ? 'Send' : 'Send without a note') : 'Next →'}
              </button>
            </div>
            {error && (
              <p id={errorId} className={styles.error} role="alert">
                {error}
              </p>
            )}
          </form>
        )}

        <button type="button" className={styles.plainLink} onClick={() => setPlain(true)}>
          Prefer a plain form?
        </button>
      </div>
    </div>
  );
}

/** The same four questions as an ordinary form, all at once. */
function PlainForm({ onBack }: { onBack: () => void }) {
  const uid = useId().replace(/:/g, '');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'mailto' | 'failed'>('idle');
  const [emailError, setEmailError] = useState('');
  const [a, setA] = useState<Answers>({ name: '', topic: '', email: '', message: '' });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(a.email.trim())) {
      setEmailError(copy.badEmail);
      document.getElementById(`${uid}-email`)?.focus();
      return;
    }
    setEmailError('');
    setState('sending');
    setState(await send(a));
  };
  const field = (k: keyof Answers) => ({
    id: `${uid}-${k}`,
    name: k,
    value: a[k],
    onChange: (e: { target: { value: string } }) => setA((v) => ({ ...v, [k]: e.target.value })),
  });

  return (
    <form className={styles.plain} onSubmit={onSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor={`${uid}-name`}>Your name</label>
        <input {...field('name')} required autoComplete="name" className={styles.input} />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${uid}-topic`}>What should we talk about?</label>
        <input {...field('topic')} list={`${uid}-topics`} className={styles.input} />
        <datalist id={`${uid}-topics`}>
          {copy.topics.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>
      <div className={styles.field}>
        <label htmlFor={`${uid}-email`}>Your email</label>
        <input
          {...field('email')}
          type="email"
          required
          autoComplete="email"
          className={styles.input}
          aria-invalid={!!emailError || undefined}
          aria-describedby={emailError ? `${uid}-emailerr` : undefined}
        />
        {emailError && (
          <p id={`${uid}-emailerr`} className={styles.error} role="alert">
            {emailError}
          </p>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor={`${uid}-message`}>Anything else? (optional)</label>
        <textarea {...field('message')} rows={3} className={styles.input} />
      </div>
      <div className={styles.row}>
        <button type="submit" className={styles.send} disabled={state === 'sending'}>
          Send
        </button>
        <button type="button" className={styles.plainLink} onClick={onBack}>
          Back to the chat
        </button>
      </div>
      <p role="status" className={styles.status}>
        {state === 'sent' && copy.sent}
        {state === 'mailto' && copy.sentMailto}
        {state === 'failed' && (
          <>
            {copy.failed} <a href={mailtoHref(a)}>{site.email}</a>
          </>
        )}
      </p>
    </form>
  );
}
