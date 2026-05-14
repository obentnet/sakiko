"use client";

import { useMemo, useState } from "react";
import QRCode from "qrcode";
import { AnimatePresence, motion } from "framer-motion";
import { IoLogoWechat } from "react-icons/io5";

type SponsorRecord = {
  name: string;
  amountLabel: string;
  note: string;
};

const sponsorRecords: SponsorRecord[] = [
  { name: "染白.", amountLabel: "￥20", note: "请喝霸王茶姬" },
];

const presetAmounts = [5, 50, 100, 648] as const;
const fixedQrPayload =
  "wxp://f2f00Ow-n7MN-OT7WaBHQYYzcc5Dd68veXfWhVCoTaxeu1rnLf0I_P9H0wYxQ1Uq27gH";

function QrCodeSvg({ value }: { value: string }) {
  const qr = useMemo(() => QRCode.create(value, { errorCorrectionLevel: "M" }), [value]);
  const moduleCount = qr.modules.size;
  const margin = 2;
  const totalSize = moduleCount + margin * 2;

  const cells = useMemo(() => {
    const points: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < moduleCount; y += 1) {
      for (let x = 0; x < moduleCount; x += 1) {
        if (qr.modules.get(x, y)) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }, [moduleCount, qr.modules]);

  return (
    <svg
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      width={320}
      height={320}
      role="img"
      aria-label="赞助二维码"
      className="h-[320px] w-[320px]"
    >
      {cells.map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x + margin}
          y={cell.y + margin}
          width="1"
          height="1"
          style={{ fill: "var(--theme-primary)" }}
        />
      ))}
    </svg>
  );
}

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resolvedAmount = useMemo(() => {
    if (!isCustomSelected) {
      return selectedAmount;
    }

    const parsed = Number.parseFloat(customAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null;
    }

    return Math.round(parsed * 100) / 100;
  }, [customAmount, isCustomSelected, selectedAmount]);

  const canDonate = resolvedAmount !== null;

  const qrPayload = fixedQrPayload;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 md:px-8 md:py-10">
      <section
        className="w-full max-w-[1040px] rounded-[48px] px-5 py-5 md:px-8 md:py-8"
        style={{
          backgroundColor: "var(--theme-panel-bg)",
          boxShadow: "0 30px 90px var(--theme-panel-shadow)",
          color: "var(--theme-panel-text)",
        }}
      >
        <div className="grid min-h-[700px] grid-cols-1 gap-5 md:grid-cols-[1.05fr_1fr]">
          <aside
            className="rounded-[36px] p-5 md:p-6"
            style={{
              backgroundColor: "var(--theme-surface-bg)",
              color: "var(--theme-surface-text)",
            }}
          >
            <h2 className="text-[28px] font-bold tracking-[-0.03em]">赞助列表</h2>
            <p className="mt-2 text-[14px]" style={{ color: "var(--theme-surface-muted)" }}>
              暂无赞助😭
            </p>

            <div className="mt-5 space-y-3">
              {sponsorRecords.map((item) => (
                <article
                  key={`${item.name}-${item.amountLabel}`}
                  className="rounded-[22px] px-4 py-3"
                  style={{
                    backgroundColor: "var(--theme-chip-bg)",
                    color: "var(--theme-chip-text)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[16px] font-bold">{item.name}</p>
                    <p className="text-[15px] font-bold">{item.amountLabel}</p>
                  </div>
                  <p className="mt-1 text-[13px]">{item.note}</p>
                </article>
              ))}
            </div>
          </aside>

          <div className="flex min-h-[600px] flex-col gap-5">
            <section
              className="rounded-[36px] px-5 py-5 md:px-6"
              style={{
                backgroundColor: "var(--theme-surface-bg)",
                color: "var(--theme-surface-text)",
              }}
            >
              <h1 className="text-[30px] font-bold tracking-[-0.03em]">赞助说明</h1>
              <p className="mt-3 text-[15px] leading-8">
                你的支持将用于站点服务器、域名续费与内容维护。
              </p>
            </section>

            <section
              className="flex flex-1 flex-col rounded-[36px] px-5 py-5 md:px-6"
              style={{
                backgroundColor: "var(--theme-surface-bg)",
                color: "var(--theme-surface-text)",
              }}
            >
              <h3 className="text-[22px] font-bold tracking-[-0.02em]">赞助金额</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {presetAmounts.map((amount) => {
                  const active = !isCustomSelected && selectedAmount === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setIsCustomSelected(false);
                        setSelectedAmount(amount);
                      }}
                      className="rounded-2xl px-4 py-3 text-[16px] font-bold transition"
                      style={{
                        backgroundColor: active ? "var(--theme-primary)" : "var(--theme-chip-bg)",
                        color: active ? "var(--theme-primary-text)" : "var(--theme-chip-text)",
                        transform: active ? "translateY(-1px)" : "none",
                      }}
                    >
                      ￥{amount}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl p-3" style={{ backgroundColor: "var(--theme-chip-bg)" }}>
                <label className="block text-[13px] font-bold" style={{ color: "var(--theme-chip-text)" }}>
                  任意金额
                </label>
                <input
                  value={customAmount}
                  onFocus={() => {
                    setIsCustomSelected(true);
                    setSelectedAmount(null);
                  }}
                  onChange={(event) => setCustomAmount(event.target.value)}
                  inputMode="decimal"
                  placeholder="例如 88.8"
                  className="mt-2 h-11 w-full rounded-xl border-0 px-3 text-[15px] outline-none"
                  style={{
                    backgroundColor: "var(--theme-surface-bg)",
                    color: "var(--theme-surface-text)",
                  }}
                />
              </div>

              <button
                type="button"
                disabled={!canDonate}
                onClick={() => setIsModalOpen(true)}
                className="mt-5 h-12 rounded-2xl text-[16px] font-bold transition"
                style={{
                  backgroundColor: canDonate ? "var(--theme-primary)" : "var(--theme-chip-bg)",
                  color: canDonate ? "var(--theme-primary-text)" : "var(--theme-surface-muted)",
                  opacity: canDonate ? 1 : 0.5,
                  cursor: canDonate ? "pointer" : "not-allowed",
                }}
              >
                立即支付
              </button>

            </section>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/28 px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="w-full max-w-[420px] rounded-[34px] p-5"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 24px 68px var(--theme-panel-shadow)",
                color: "var(--theme-page-text)",
              }}
            >
              <h4 className="text-[24px] font-bold tracking-[-0.02em]">扫码赞助</h4>
              <p className="mt-1 text-[14px]">金额：￥{resolvedAmount?.toString() ?? "-"}</p>

              <motion.div
                className="mt-4 flex items-center justify-center rounded-[24px] p-4"
                style={{ backgroundColor: "transparent" }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08, duration: 0.24, ease: "easeOut" }}
              >
                {canDonate ? (
                  <div className="rounded-[18px] p-2" style={{ backgroundColor: "transparent" }}>
                    <QrCodeSvg value={qrPayload} />
                  </div>
                ) : null}
              </motion.div>
              <p
                className="mt-1 flex items-center justify-center gap-1.5 text-[12px] font-medium"
                style={{ color: "var(--theme-surface-muted)" }}
              >
                <IoLogoWechat className="text-[14px]" />
                <span>请使用微信支付</span>
              </p>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mt-4 h-11 w-full rounded-2xl text-[15px] font-bold"
                style={{
                  backgroundColor: "var(--theme-primary)",
                  color: "var(--theme-primary-text)",
                }}
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
