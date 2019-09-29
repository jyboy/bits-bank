var express = require('express');
var bcrypt = require('bcryptjs');
var db = require('../dao/db');

var router = express.Router();

// get index
router.get('/', (req, res) => {
    res.render('index');
});

// register account
router.post('/register', (req, res) => {
    var { username, password } = req.body;
    if (!validateUser(username)) {
        res.send({
            code: -1,
            msg: 'username invalid'
        });
        return;
    }
    if (!password) {
        res.send({
            code: -2,
            msg: 'password empty'
        });
        return;
    }
    db.getUser(username, (err, data) => {
        if (err) {
            res.send({
                code: -3,
                msg: 'system busy'
            });
            return;
        }
        if (data.length) {
            res.send({
                code: -4,
                msg: 'already registered'
            });
            return;
        }
        bcrypt.hash(password, 8, (err, hash) => {
            if (err) {
                res.send({
                    code: -5,
                    msg: 'system busy'
                });
                return;
            }
            db.addUser(username, hash, err => {
                if (err) {
                    res.send({
                        code: -6,
                        msg: 'system busy'
                    });
                    return;
                }
                res.send({
                    code: 0,
                    msg: 'success'
                });
            });
        });
    });
});

// get balance
router.post('/balance', (req, res) => {
    var { username, password } = req.body;
    if (!validateUser(username)) {
        res.send({
            code: -1,
            msg: 'username invalid'
        });
        return;
    }
    if (!password) {
        res.send({
            code: -2,
            msg: 'password empty'
        });
        return;
    }
    db.getUser(username, (err, data) => {
        if (err) {
            res.send({
                code: -3,
                msg: 'system busy'
            });
            return;
        }
        if (!data.length) {
            res.send({
                code: -4,
                msg: 'unregistered'
            });
            return;
        }
        var { hash, balance } = data[0];
        bcrypt.compare(password, hash, (err, valid) => {
            if (!valid) {
                res.send({
                    code: -5,
                    msg: 'password incorrect'
                });
                return;
            }
            res.send({
                code: 0,
                msg: 'success',
                balance: balance
            });
        });
    });
});

// deposit money
router.post('/deposit', (req, res) => {
    var { username, amount } = req.body;
    if (!validateUser(username)) {
        res.send({
            code: -1,
            msg: 'username invalid'
        });
        return;
    }
    if (!validateAmount(amount)) {
        res.send({
            code: -2,
            msg: 'amount invalid'
        });
        return;
    }
    db.getUser(username, (err, data) => {
        if (err) {
            res.send({
                code: -3,
                msg: 'system busy'
            });
            return;
        }
        if (!data.length) {
            res.send({
                code: -4,
                msg: 'unregistered'
            });
            return;
        }
        db.incrBalance(username, amount, err => {
            if (err) {
                res.send({
                    code: -5,
                    msg: 'system busy'
                });
                return;
            }
            res.send({
                code: 0,
                msg: 'success'
            });
        });
    });
});

// withdraw money
router.post('/withdraw', (req, res) => {
    var { username, password, amount } = req.body;
    if (!validateUser(username)) {
        res.send({
            code: -1,
            msg: 'username invalid'
        });
        return;
    }
    if (!password) {
        res.send({
            code: -2,
            msg: 'password empty'
        });
        return;
    }
    if (!validateAmount(amount)) {
        res.send({
            code: -3,
            msg: 'amount invalid'
        });
        return;
    }
    db.getUser(username, (err, data) => {
        if (err) {
            res.send({
                code: -4,
                msg: 'system busy'
            });
            return;
        }
        if (!data.length) {
            res.send({
                code: -5,
                msg: 'unregistered'
            });
            return;
        }
        var { hash, balance } = data[0];
        bcrypt.compare(password, hash, (err, valid) => {
            if (!valid) {
                res.send({
                    code: -6,
                    msg: 'password incorrect'
                });
                return;
            }
            if (balance < amount) {
                res.send({
                    code: -7,
                    msg: 'balance not enough'
                });
                return;
            }
            db.decrBalance(username, amount, err => {
                if (err) {
                    res.send({
                        code: -8,
                        msg: 'system busy'
                    });
                    return;
                }
                res.send({
                    code: 0,
                    msg: 'success'
                });
            });
        });
    });
});

// transfer money
router.post('/transfer', (req, res) => {
    var { username, password, amount, payee } = req.body;
    if (!validateUser(username)) {
        res.send({
            code: -1,
            msg: 'username invalid'
        });
        return;
    }
    if (!password) {
        res.send({
            code: -2,
            msg: 'password empty'
        });
        return;
    }
    if (!validateAmount(amount)) {
        res.send({
            code: -3,
            msg: 'amount invalid'
        });
        return;
    }
    if (!validateUser(payee)) {
        res.send({
            code: -4,
            msg: 'payee invalid'
        });
        return;
    }
    if (payee === username) {
        res.send({
            code: -5,
            msg: 'payee same'
        });
        return;
    }
    db.getUser(username, (err, data) => {
        if (err) {
            res.send({
                code: -6,
                msg: 'system busy'
            });
            return;
        }
        if (!data.length) {
            res.send({
                code: -7,
                msg: 'unregistered'
            });
            return;
        }
        var { hash, balance } = data[0];
        bcrypt.compare(password, hash, (err, valid) => {
            if (!valid) {
                res.send({
                    code: -8,
                    msg: 'password incorrect'
                });
                return;
            }
            if (balance < amount) {
                res.send({
                    code: -9,
                    msg: 'balance not enough'
                });
                return;
            }
            db.getUser(payee, (err, data) => {
                if (err) {
                    res.send({
                        code: -10,
                        msg: 'system busy'
                    });
                    return;
                }
                if (!data.length) {
                    res.send({
                        code: -11,
                        msg: 'payee unregistered'
                    });
                    return;
                }
                db.transferMoney(username, amount, payee, err => {
                    if (err) {
                        res.send({
                            code: -12,
                            msg: 'system busy'
                        });
                        return;
                    }
                    db.logTransfer(username, amount, payee, err => {
                        if (err) {
                            res.send({
                                code: -13,
                                msg: 'system busy'
                            });
                            return;
                        }
                        res.send({
                            code: 0,
                            msg: 'success'
                        });
                    });
                });
            });
        });
    });
});

// get transfer history
router.post('/history', (req, res) => {
    var { username, password } = req.body;
    if (!validateUser(username)) {
        res.send({
            code: -1,
            msg: 'username invalid'
        });
        return;
    }
    if (!password) {
        res.send({
            code: -2,
            msg: 'password empty'
        });
        return;
    }
    db.getUser(username, (err, data) => {
        if (err) {
            res.send({
                code: -3,
                msg: 'system busy'
            });
            return;
        }
        if (!data.length) {
            res.send({
                code: -4,
                msg: 'password incorrect'
            });
            return;
        }
        var { hash } = data[0];
        bcrypt.compare(password, hash, (err, valid) => {
            if (!valid) {
                res.send({
                    code: -5,
                    msg: 'password incorrect'
                });
                return;
            }
            db.getTransfer(username, (err, data2) => {
                if (err) {
                    res.send({
                        code: -6,
                        msg: 'system busy'
                    });
                    return;
                }
                db.getTotal(username, (err, data3) => {
                    if (err) {
                        res.send({
                            code: -7,
                            msg: 'system busy'
                        });
                        return;
                    }
                    var [expenditure, income] = [0, 0];
                    if (data3.length === 1) {
                        if (data3[0].type === 1) {
                            expenditure = data3[0].total;
                        } else {
                            income = data3[0].total;
                        }
                    } else if (data3.length === 2) {
                        [expenditure, income] = data3.map(val => val.total);
                    }
                    res.send({
                        code: 0,
                        msg: 'success',
                        history: data2,
                        expenditure: expenditure,
                        income: income
                    });
                });
            });
        });
    });
});

function validateUser(username) {
    return /^[A-Za-z0-9-_]{1,128}$/.test(username);
}

function validateAmount(amount) {
    return /^([1-9][0-9]{0,5})$/.test(amount);
}

module.exports = router;
