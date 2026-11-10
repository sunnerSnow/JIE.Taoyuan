"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/admin/wishes/actions";

export function AdminLogin() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mx-auto mt-10 max-w-sm rounded-[24px] border-2 border-edge bg-paper p-6 shadow-soft">
      <label htmlFor="admin-password" className="text-[15px] font-black">
        管理密碼
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="mt-2 w-full rounded-2xl border-2 border-edge px-4 py-3 text-[16px] outline-none focus:border-teal-deep"
      />
      {error && (
        <p role="alert" className="mt-2 text-[14px] font-bold text-coral">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-ink mt-4 w-full">
        {pending ? "登入中…" : "登入"}
      </button>
    </form>
  );
}

/** 需要再確認一次的按鈕（刪除、下架） */
export function ConfirmButton({ children, message, className = "", name, value }: { children: React.ReactNode; message: string; className?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
