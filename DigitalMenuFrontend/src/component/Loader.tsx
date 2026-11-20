export default function LoadingScreen() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--loader-bg)' }}
    >
      <div
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2"
        style={{
          backgroundColor: 'var(--loader-surface)',
          borderColor: 'var(--loader-surface)',
        }}
      >
        <div
          className="h-7 w-7 animate-spin rounded-full border-[2.5px]"
          style={{
            borderColor: 'var(--loader-track)',
            borderTopColor: 'var(--loader-head)',
          }}
        />
      </div>
      <div className="mt-4 font-medium" style={{ color: 'var(--loader-text)' }}>
        Loading...
      </div>
    </div>
  );
}
