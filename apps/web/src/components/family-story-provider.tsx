"use client";

/**
 * One in-memory story state for every /try page. It lives in the /try layout,
 * so normal navigation, Back and Forward keep it; a full page load resets it.
 * No storage, no cookie, no network, no identity.
 */
import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import { initialStory, transitionStory, type StoryAction, type StoryState } from "@/lib/family-story-state";
import { transitionFamilyPractice } from "@/lib/family-public-practice";

type PracticeAction = Extract<StoryAction, { type: "practice" }>;
type StoryContextValue = {
  story: StoryState;
  dispatch: (action: StoryAction) => void;
  /** Dispatch a practice action and return the resulting practice state (pure preview of the same transition). */
  act: (action: PracticeAction) => StoryState["practice"];
};
const StoryContext = createContext<StoryContextValue | null>(null);

export function FamilyStoryProvider({ children }: { children: ReactNode }) {
  const [story, dispatch] = useReducer(transitionStory, undefined, initialStory);
  const act = useCallback((action: PracticeAction) => {
    const next = transitionFamilyPractice(story.practice, action.action);
    dispatch(action);
    return next;
  }, [story.practice]);
  const value = useMemo(() => ({ story, dispatch, act }), [story, act]);
  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
}

export function useFamilyStory(): StoryContextValue {
  const value = useContext(StoryContext);
  if (!value) throw new Error("useFamilyStory must be used inside /try");
  return value;
}
