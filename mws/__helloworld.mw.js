module.exports = ({ meta, config, managers }) => {
	return ({ req, res, next }) => {
		next("hello World !");
	};
};
