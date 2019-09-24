# Bits Bank

**Bits Bank** is a mini net bank. To preview online, please visit [bits.atsjtu.cc](https://bits.atsjtu.cc)

## Technologies

- Front-end: `Vue.js`, `Element`, `axios`
- Back-end: `Node.js`, `Express`, `bcrypt`
- Database: `MySQL`

## Database

- Database: bits
- Table: user, transfer

```sql
CREATE TABLE `user` (
  `username` varchar(128) NOT NULL DEFAULT '',
  `password` char(60) NOT NULL DEFAULT '',
  `balance` int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

```sql
CREATE TABLE `transfer` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(128) NOT NULL DEFAULT '',
  `type` tinyint(3) unsigned NOT NULL,
  `amount` int(11) unsigned NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
```

## Usage

```
git clone git@github.com:jyboy/bits-bank.git
cd bits-bank
npm install
npm start
```

> **Note**: Before `npm start`, please confirm configuration in `config.js` first.
