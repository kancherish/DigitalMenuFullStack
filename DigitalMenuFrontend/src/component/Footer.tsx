const Footer = () => {
  return (
    <div
      className="mt-auto text-center py-2 px-4 border-t"
      style={{
        color: 'color-mix(in srgb, var(--body-text, #334155) 70%, transparent)',
        borderColor:
          'color-mix(in srgb, var(--body-text, #334155) 15%, transparent)',
      }}
    >
      <p className="text-xs leading-tight">
        Please inform your server of any dietary restrictions or allergies
      </p>
      <p className="text-xs leading-tight mt-1">
        Powered by{' '}
        <a
          href="https://www.cornertech.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: 'var(--accent, #0ea5e9)' }}
        >
          Corner Tech
        </a>
      </p>
    </div>
  );
};

export default Footer;