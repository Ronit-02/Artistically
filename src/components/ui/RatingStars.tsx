interface RatingStarsProps {
  rating: number;
  reviews?: number | null;
  size?: "sm" | "md";
  onStarClick?: () => void;
}

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

export default function RatingStars({ rating, reviews, size = "sm", onStarClick }: RatingStarsProps) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${onStarClick ? "cursor-pointer" : ""}`} onClick={onStarClick}>
      <div className="flex items-center gap-0.5">
        {Array(full).fill(0).map((_, i) => (
          <svg key={`f${i}`} className={`${starSize} text-yellow-400`} viewBox="0 0 20 20" fill="currentColor"><path d={STAR_PATH}/></svg>
        ))}
        {half && (
          <svg className={`${starSize} text-yellow-400`} viewBox="0 0 20 20" fill="currentColor">
            <defs><linearGradient id="half-grad"><stop offset="50%" stopColor="currentColor"/><stop offset="50%" stopColor="#d1d5db"/></linearGradient></defs>
            <path fill="url(#half-grad)" d={STAR_PATH}/>
          </svg>
        )}
        {Array(empty).fill(0).map((_, i) => (
          <svg key={`e${i}`} className={`${starSize} text-gray-300`} viewBox="0 0 20 20" fill="currentColor"><path d={STAR_PATH}/></svg>
        ))}
      </div>
      {reviews != null && <span className="text-xs text-gray-500">({reviews})</span>}
    </div>
  );
}
