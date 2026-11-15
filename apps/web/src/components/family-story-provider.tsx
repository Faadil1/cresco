"use client";

/**
 * One in-memory story state for every /try page. It lives in the /try layout,
 * so normal navigation, Back and Forward keep it; a full page load resets it.
 * No storage, no cookie, no network, no identity.
 */
import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import { initialStory, transitionStory, type StoryAction, type StoryState } from "@/lib/family-story-state";
import { transitionFamilyPractice } from "@/lib/family-public-practice";
import { initialRealMarketState, transitionRealMarket, type RealMarketAction, type RealMarketState } from "@/lib/family-real-market-sandbox";

type PracticeAction = Extract<StoryAction, { type: "practice" }>;
type StoryContextValue = {
  story: StoryState;
  dispatch: (action: StoryAction) => void;
  /** Dispatch a practice action and return the resulting practice state (pure preview of the same transition). */
  act: (action: PracticeAction) => StoryState["practice"];
};
const StoryContext = createContext<StoryContextValue | null>(null);
type RealMarketContextValue = { market: RealMarketState; marketDispatch: (action: RealMarketAction) => void };
const RealMarketContext = createContext<RealMarketContextValue | null>(null);

export function FamilyStoryProvider({ children }: { children: ReactNode }) {
  const [story, storyDispatch] = useReducer(transitionStory, undefined, initialStory);
  const [market, marketDispatch] = useReducer(transitionRealMarket, undefined, initialRealMarketState);
  // A new Family session must clear BOTH the original practice and the
  // separate imaginary USD book. Neither reducer can alter the other.
  const dispatch = useCallback((action: StoryAction) => {
    if (action.type === "practice" && action.action.type === "reset") marketDispatch({type:"reset"});
    storyDispatch(action);
  }, []);
  const act = useCallback((action: PracticeAction) => {
    const next = transitionFamilyPractice(story.practice, action.action);
    dispatch(action);
    return next;
  }, [story.practice, dispatch]);
  const value = useMemo(() => ({ story, dispatch, act }), [story, act, dispatch]);
  const marketValue = useMemo(() => ({ market, marketDispatch }), [market]);
  return (
    <RealMarketContext.Provider value={marketValue}>
      <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
    </RealMarketContext.Provider>
  );
}

export function useFamilyStory(): StoryContextValue {
  const value = useContext(StoryContext);
  if (!value) throw new Error("useFamilyStory must be used inside /try");
  return value;
}

export function useRealMarketPractice(): RealMarketContextValue {
  const value = useContext(RealMarketContext);
  if (!value) throw new Error("useRealMarketPractice must be used inside /try");
  return value;
}
