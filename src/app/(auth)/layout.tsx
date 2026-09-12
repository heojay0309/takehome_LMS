export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <video
        src="https://cdn.prod.website-files.com/60bec73c3161d258cff8900b%2F667c0477f2d119e2868832ac_Megan%20Broll%20Header%20V2%20%281%29-transcode.mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
      />
      {children}
    </div>
  );
}
