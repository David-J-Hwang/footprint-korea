import {
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useEffect } from 'react'

type ConfirmDialogProps = {
  cancelLabel?: string
  confirmLabel?: string
  errorMessage?: string
  isConfirming?: boolean
  isOpen: boolean
  message: string
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmDialog({
  cancelLabel = '취소',
  confirmLabel = '삭제',
  errorMessage,
  isConfirming = false,
  isOpen,
  message,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isConfirming) {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isConfirming, isOpen, onCancel])

  if (!isOpen) {
    return null
  }

  return (
    <div
      aria-labelledby="confirm-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-stone-950/45 px-4 py-6"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-5 shadow-xl">
        <h2
          className="text-lg font-semibold leading-7 text-stone-950"
          id="confirm-dialog-title"
        >
          {message}
        </h2>

        {errorMessage ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-700/15 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400 sm:w-auto"
            disabled={isConfirming}
            onClick={onCancel}
            type="button"
          >
            <XMarkIcon aria-hidden="true" className="size-4" />
            {cancelLabel}
          </button>
          <button
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-700/20 disabled:cursor-not-allowed disabled:bg-rose-300 sm:w-auto"
            disabled={isConfirming}
            onClick={onConfirm}
            type="button"
          >
            <TrashIcon aria-hidden="true" className="size-4" />
            {isConfirming ? '삭제하는 중...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
