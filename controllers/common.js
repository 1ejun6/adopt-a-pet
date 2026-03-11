function convertarray(a) {
    //if not array > convert to array > filter array to remove any null, define, ... values
    return (Array.isArray(a) ? a : [a]).filter(Boolean);
}

module.exports = { convertarray };