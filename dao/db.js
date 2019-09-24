var mysql = require('mysql');
var config = require('../config');

var pool = mysql.createPool(config.db);

function addUser(username, hash, cb) {
    pool.getConnection((err, conn) => {
        if (err) {
            typeof cb === 'function' && cb(err);
            return;
        }
        conn.query('INSERT INTO user (username, password) VALUES (?, ?)', [username, hash], err => {
            typeof cb === 'function' && cb(err);
            conn.release();
        });
    });
}

function getUser(username, cb) {
    pool.getConnection((err, conn) => {
        if (err) {
            typeof cb === 'function' && cb(err, []);
            return;
        }
        conn.query('SELECT password as hash, balance FROM user WHERE username = ?', [username], (err, data) => {
            typeof cb === 'function' && cb(err, data);
            conn.release();
        });
    });
}

function incrBalance(username, amount, cb) {
    pool.getConnection((err, conn) => {
        if (err) {
            typeof cb === 'function' && cb(err);
            return;
        }
        conn.query('UPDATE user SET balance = balance + ? WHERE username = ?', [amount, username], err => {
            typeof cb === 'function' && cb(err);
            conn.release();
        });
    });
}

function decrBalance(username, amount, cb) {
    pool.getConnection((err, conn) => {
        if (err) {
            typeof cb === 'function' && cb(err);
            return;
        }
        conn.query('UPDATE user SET balance = balance - ? WHERE username = ?', [amount, username], err => {
            typeof cb === 'function' && cb(err);
            conn.release();
        });
    });
}

function transferMoney(username, amount, payee, cb) {
    pool.getConnection((err, conn) => {
        if (err) {
            typeof cb === 'function' && cb(err);
            return;
        }
        conn.query('UPDATE user SET balance = balance - ? WHERE username = ?', [amount, username], err => {
            if (err) {
                conn.rollback(() => {
                    typeof cb === 'function' && cb(err);
                    return;
                });
            }
            conn.query('UPDATE user SET balance = balance + ? WHERE username = ?', [amount, payee], err => {
                if (err) {
                    conn.rollback(() => {
                        typeof cb === 'function' && cb(err);
                        return;
                    });
                }
                conn.commit(err => {
                    if (err) {
                        conn.rollback(() => {
                            typeof cb === 'function' && cb(err);
                            return;
                        });
                    }
                    typeof cb === 'function' && cb(err);
                    conn.release();
                });
            });
        });
    });
}

function logTransfer(username, amount, payee, cb) {
    pool.getConnection((err, conn) => {
        if (err) {
            typeof cb === 'function' && cb(err);
            return;
        }
        conn.query('INSERT INTO transfer (username, type, amount) VALUES (?, ?, ?)', [username, 1, amount], err => {
            if (err) {
                conn.rollback(() => {
                    typeof cb === 'function' && cb(err);
                    return;
                });
            }
            conn.query('INSERT INTO transfer (username, type, amount) VALUES (?, ?, ?)', [payee, 2, amount], err => {
                if (err) {
                    conn.rollback(() => {
                        typeof cb === 'function' && cb(err);
                        return;
                    });
                }
                conn.commit(err => {
                    if (err) {
                        conn.rollback(() => {
                            typeof cb === 'function' && cb(err);
                            return;
                        });
                    }
                    typeof cb === 'function' && cb(err);
                    conn.release();
                });
            });
        });
    });
}

function getTransfer(username, cb) {
    pool.getConnection((err, conn) => {
        if (err) {
            typeof cb === 'function' && cb(err, []);
            return;
        }
        conn.query("SELECT type, amount, DATE_FORMAT(time, '%Y-%m-%d %H:%i:%S') as time FROM transfer WHERE username = ? ORDER BY time DESC", [username], (err, data) => {
            typeof cb === 'function' && cb(err, data);
            conn.release();
        });
    });
}

function getTotal(username, cb) {
    pool.getConnection((err, conn) => {
        if (err) {
            typeof cb === 'function' && cb(err, []);
            return;
        }
        conn.query('SELECT type, SUM(amount) as total FROM transfer WHERE username = ? GROUP BY type ORDER BY type', [username], (err, data) => {
            typeof cb === 'function' && cb(err, data);
            conn.release();
        });
    });
}

module.exports = { addUser, getUser, incrBalance, decrBalance, transferMoney, logTransfer, getTransfer, getTotal };
