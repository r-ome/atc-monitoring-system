import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col gap-6 w-full h-screen border-4 items-center justify-center">
      <div className="text-8xl">404 Page not found</div>
      <div>
        <Link to="/" className="text-5xl underline cursor-pointer">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
