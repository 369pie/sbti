import { TodayViewTracker } from './TodayViewTracker';

export default function TodayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TodayViewTracker />
      {children}
    </>
  );
}
