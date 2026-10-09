const LoadingSpinner = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#5a1f7a]/20 bg-white p-10 text-center">
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f2edf9]">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#5a1f7a]/30 border-t-[#5a1f7a]" />
    </span>
    {label ? <p className="text-sm font-medium text-[#1b1a4a]">{label}</p> : null}
  </div>
);

export default LoadingSpinner;
