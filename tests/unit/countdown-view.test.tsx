// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, act } from "@testing-library/react";
import { LaunchCountdown } from "@/features/countdown/launch-countdown";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
it("changes to launch availability guidance when its deadline arrives", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-04T22:59:40Z"));
  render(<LaunchCountdown />);
  expect(screen.getByLabelText(/until the announced launch/)).toBeTruthy();
  act(() => {
    vi.advanceTimersByTime(30000);
  });
  expect(screen.getByText(/announced launch time has arrived/)).toBeTruthy();
  expect(screen.queryByLabelText(/until the announced launch/)).toBeNull();
});
it("keeps the preparation link accessible and removes its timer on unmount", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-06T12:00:00Z"));
  const interval = vi.spyOn(window, "setInterval");
  const clear = vi.spyOn(window, "clearInterval");
  const view = render(<LaunchCountdown />);
  expect(
    screen
      .getByRole("link", { name: /Get ready for launch/ })
      .getAttribute("href"),
  ).toMatch(/^\/launch\/?$/);
  const timer = interval.mock.results[0].value;
  view.unmount();
  expect(clear).toHaveBeenCalledWith(timer);
  interval.mockRestore();
  clear.mockRestore();
});
