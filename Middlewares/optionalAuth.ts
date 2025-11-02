import passport from "passport";

export const optionalAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      console.error("Passport auth error:", err);
      return next();
    }
    if (user) {
      req.user = user; // attach user if valid token
    }
    next(); // always continue — even if no user
  })(req, res, next);
};
