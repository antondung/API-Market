import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { StoreProvider } from "../features/store";
import {
  LANGUAGE_KEY,
  setLanguage,
  t,
  resetLanguageFromStorage,
} from "../i18n";
import vi from "../i18n/vi.json";
import manifest from "../screens/manifest.json";
const catalog: Record<string, string> = vi;
function mount(path: string, role = "consumer") {
  localStorage.setItem(
    "api-hub-demo-session",
    JSON.stringify({
      name: "Alex Developer",
      email: "alex@example.test",
      role,
      expiresAt: Date.now() + 1800000,
    }),
  );
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </MemoryRouter>,
  );
}
describe("Vietnamese / English localization", () => {
  it("switches in place, updates accessibility and persists after remount", async () => {
    const first = mount("/marketplace");
    expect(
      screen.getByRole("heading", { name: "Explore High-Performance APIs" }),
    ).toBeTruthy();
    const search = screen.getByRole("textbox", { name: "Search APIs" });
    fireEvent.change(search, { target: { value: "Neural" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Language" }), {
      target: { value: "vi" },
    });
    expect(screen.getByRole("combobox", { name: "Ngôn ngữ" })).toBeTruthy();
    expect(
      (
        screen.getByRole("textbox", {
          name: t("Search APIs"),
        }) as HTMLInputElement
      ).value,
    ).toBe("Neural");
    expect(document.documentElement.lang).toBe("vi");
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("vi");
    expect(document.title).toBe("Khám phá API · API Hub");
    first.unmount();
    act(() => resetLanguageFromStorage());
    mount("/marketplace");
    expect(screen.getByRole("combobox", { name: "Ngôn ngữ" })).toBeTruthy();
    fireEvent.change(screen.getByRole("combobox", { name: "Ngôn ngữ" }), {
      target: { value: "en" },
    });
    expect(
      screen.getByRole("heading", { name: "Explore High-Performance APIs" }),
    ).toBeTruthy();
  });
  it("keeps internal select values in English while displaying Vietnamese labels", async () => {
    act(() => setLanguage("vi"));
    mount("/checkout?api=fx");
    const user = userEvent.setup();
    const result = screen.getByRole("combobox", {
      name: "Kết quả thanh toán mô phỏng",
    }) as HTMLSelectElement;
    await user.selectOptions(result, "Failure");
    expect(result.value).toBe("Failure");
    expect(result.selectedOptions[0].textContent).toBe("Thất bại");
    const period = screen.getByRole("combobox", {
      name: "Chu kỳ thanh toán",
    }) as HTMLSelectElement;
    await user.selectOptions(period, "Annual");
    expect(period.value).toBe("Annual");
    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: "Xác nhận thanh toán thử nghiệm" }),
    );
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      t(
        "Sandbox payment failed. No subscription was created. Choose another outcome to retry.",
      ),
    );
  });
  it("preserves names and technical examples; interpolates only the surrounding message", () => {
    setLanguage("vi");
    expect(t("Welcome back, Lê Hải Dương")).toBe(
      "Chào mừng trở lại, Lê Hải Dương",
    );
    expect(t("Neural LLM v4")).toBe("Neural LLM v4");
    expect(t("POST")).toBe("POST");
    expect(t("https://api.example.com/v1/health")).toBe(
      "https://api.example.com/v1/health",
    );
    expect(t("content_copy Copy Token")).toBe(t("Copy Token"));
    expect(t("/ $250 limit")).toBe("/ giới hạn $250");
    setLanguage("en");
    expect(t("Welcome back, Lê Hải Dương")).toBe("Welcome back, Lê Hải Dương");
  });
  it("has no empty translations and preserves every interpolation variable", () => {
    for (const [key, value] of Object.entries(catalog)) {
      expect(value.trim(), key).not.toBe("");
      expect(value.match(/\{\{\d+\}\}/g)?.sort() || [], key).toEqual(
        key.match(/\{\{\d+\}\}/g)?.sort() || [],
      );
    }
  });
  for (const route of manifest)
    it(`renders Vietnamese title and translated screen: ${route.path}`, async () => {
      act(() => setLanguage("vi"));
      mount(
        route.path,
        ["public", "design"].includes(route.role) ? "consumer" : route.role,
      );
      await waitFor(() =>
        expect(document.title).toBe(`${t(route.title)} · API Hub`),
      );
      await waitFor(() =>
        expect(screen.queryByText("Đang tải không gian làm việc…")).toBeNull(),
      );
      expect(screen.getByRole("combobox", { name: "Ngôn ngữ" })).toBeTruthy();
      expect(
        screen.queryByRole("heading", { name: "404 · Không tìm thấy trang" }),
      ).toBeNull();
    });
  for (const [path, role] of [
    ["/account", "provider"],
    ["/notifications", "admin"],
    ["/provider/revenue", "provider"],
    ["/admin/apis", "admin"],
    ["/admin/subscriptions", "admin"],
    ["/app/reports", "consumer"],
  ])
    it(`keeps shared and additional routes available: ${path}`, async () => {
      act(() => setLanguage("vi"));
      mount(path, role);
      await waitFor(() =>
        expect(
          screen.queryByRole("heading", { name: "404 · Không tìm thấy trang" }),
        ).toBeNull(),
      );
      expect(document.querySelector("main h1")).toBeTruthy();
    });
  it("keeps source-screen actions working after translating their labels", async () => {
    act(() => setLanguage("vi"));
    mount("/app/overview");
    const link = await screen.findByRole("link", { name: "Tạo khóa API mới" });
    await userEvent.setup().click(link);
    expect(
      await screen.findByRole("heading", {
        name: "Khóa API và thông tin xác thực",
      }),
    ).toBeTruthy();
  });
  it("searches translated categories and keeps user-entered data across language switches", async () => {
    act(() => setLanguage("vi"));
    const view = mount("/marketplace");
    fireEvent.change(screen.getByRole("textbox", { name: t("Search APIs") }), {
      target: { value: "học máy" },
    });
    expect(
      screen.getByRole("heading", { name: "Neural LLM Inference v4" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Global FX Settlement" }),
    ).toBeNull();
    view.unmount();
    mount("/app/keys");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Tạo khóa API mới" }));
    await user.type(
      screen.getByRole("textbox", { name: "Tên khóa" }),
      "Khóa sản xuất",
    );
    act(() => setLanguage("en"));
    expect(
      (screen.getByRole("textbox", { name: "Key name" }) as HTMLInputElement)
        .value,
    ).toBe("Khóa sản xuất");
    await user.click(screen.getByRole("button", { name: "Create key" }));
    expect(
      screen.getByRole("heading", { name: "Copy your new key now" }),
    ).toBeTruthy();
    expect(localStorage.getItem("api-hub-demo-data-v1")).toContain(
      "Khóa sản xuất",
    );
  });
  it("keeps source search working with a Vietnamese placeholder", async () => {
    act(() => setLanguage("vi"));
    mount("/");
    const user = userEvent.setup();
    await user.type(await screen.findByRole("textbox"), "Neural");
    await user.click(screen.getByRole("button", { name: "Tìm kiếm" }));
    expect(
      await screen.findByRole("heading", { name: "Neural LLM Inference v4" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Global FX Settlement" }),
    ).toBeNull();
    expect(t("API approved.")).toBe("Đã duyệt API.");
    expect(
      t("Approve: Neural. Saved in the local demo audit trail."),
    ).toContain("Duyệt");
    expect(
      t("Approve: Neural. Saved in the local demo audit trail."),
    ).not.toContain("Approve");
  });
});
