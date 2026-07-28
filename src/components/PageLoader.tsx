export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div 
          className="absolute inset-0 rounded-full border-[3px] border-primary/10 border-t-primary border-r-primary animate-spin" 
          style={{ animationDuration: '0.5s' }}
        ></div>
        <span 
          className="text-xl animate-pulse" 
          style={{ animationDuration: '1s' }}
        >
          🔥
        </span>
      </div>
    </div>
  );
}
