import { withAuth } from "next-auth/middleware";

const middleware = withAuth({
  pages: {
    signIn: "/", 
  },
});

export default middleware;
export const proxy = middleware;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/vehicles/:path*",
    "/documents/:path*",
    "/stats/:path*",
    "/settings/:path*",
  ],
};