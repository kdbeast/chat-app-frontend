import { Link } from "react-router";
import logoSvg from "@/assets/images.jpeg";
import { cn } from "@/lib/utils";

interface LogoProps {
  url?: string;
  showText?: boolean;
  imgClass?: string;
  textClass?: string;
}

const Logo = ({
  url = "/",
  showText = true,
  textClass = "text-[24px]",
  imgClass = "size-[40px] rounded-full",
}: LogoProps) => (
  <Link to={url} className="flex items-center gap-2 w-fit">
    <img src={logoSvg} alt="TalkBridge" className={cn(imgClass)} />
    {showText && (
      <span className={cn("font-semibold text-lg leading-tight", textClass)}>
        TalkBridge
      </span>
    )}
  </Link>
);

export default Logo;