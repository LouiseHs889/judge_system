let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../model").member;

module.exports = (passport) => {
    let PASSWORD_SECRET = "i am proud of myself";
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    opts.secretOrKey = PASSWORD_SECRET;
    console.log("222");
    passport.use(
        new JwtStrategy(opts, async function (jwt_payload, done) {
            console.log(jwt_payload);
            try {
                let foundUser = await User.findOne({ _id: jwt_payload._id }).exec();
                if (foundUser) {
                    
                    return done(null, foundUser); // req.user <= foundUser
                } else {
                    return done(null, false);
                }
            } catch (e) {
                return done(e, false);
            }
        })
    );
};
