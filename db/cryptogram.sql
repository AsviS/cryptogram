-- phpMyAdmin SQL Dump
-- version 4.6.1
-- http://www.phpmyadmin.net
--
-- Хост: localhost
-- Время создания: Сен 21 2016 г., 13:13
-- Версия сервера: 5.7.13-6-beget-log
-- Версия PHP: 5.6.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `a98867w4_rada`
--

-- --------------------------------------------------------

--
-- Структура таблицы `z_atoms`
--
-- Создание: Сен 10 2016 г., 23:32
-- Последнее обновление: Сен 21 2016 г., 10:12
--

DROP TABLE IF EXISTS `z_atoms`;
CREATE TABLE `z_atoms` (
  `id` int(11) NOT NULL,
  `parent_msg_id` int(11) NOT NULL,
  `datetime` datetime NOT NULL,
  `time` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `body` text NOT NULL,
  `number_atom` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `z_msgs`
--
-- Создание: Сен 20 2016 г., 11:41
-- Последнее обновление: Сен 21 2016 г., 10:12
--

DROP TABLE IF EXISTS `z_msgs`;
CREATE TABLE `z_msgs` (
  `id` int(11) NOT NULL,
  `packet_key` varchar(32) NOT NULL,
  `user_from` int(11) NOT NULL,
  `user_to` int(11) NOT NULL,
  `encrypt_sync_key_data` text NOT NULL,
  `type_send` varchar(10) NOT NULL,
  `count_atoms` int(5) NOT NULL,
  `status` int(1) NOT NULL,
  `datetime` datetime NOT NULL,
  `time` int(11) NOT NULL,
  `dead_time` int(11) NOT NULL,
  `crypto_line` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `z_users`
--
-- Создание: Сен 20 2016 г., 07:46
-- Последнее обновление: Сен 21 2016 г., 10:13
--

DROP TABLE IF EXISTS `z_users`;
CREATE TABLE `z_users` (
  `id` int(11) NOT NULL,
  `user_name` varchar(20) NOT NULL,
  `word_secret` varchar(50) NOT NULL,
  `password` varchar(32) NOT NULL,
  `sid` varchar(32) NOT NULL,
  `public_key` text NOT NULL,
  `datetime` datetime NOT NULL,
  `time` int(11) NOT NULL,
  `about_1` int(1) NOT NULL,
  `sound_on` int(1) NOT NULL DEFAULT '1',
  `user_block_hash` varchar(32) NOT NULL,
  `block` int(1) NOT NULL,
  `log_on` int(1) NOT NULL,
  `long_time` int(11) NOT NULL,
  `long_state` varchar(10) NOT NULL,
  `theme` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `z_users`
--

INSERT INTO `z_users` (`id`, `user_name`, `word_secret`, `password`, `sid`, `public_key`, `datetime`, `time`, `about_1`, `sound_on`, `user_block_hash`, `block`) VALUES
(1, 'root', '63a9f0ea7bb98050796b649e85481845', '202cb962ac59075b964b07152d234b70', '', '', '2016-09-21 12:31:15', 1474450275, 0, 1, 'de0ef5709973a51bfed618332db7aa04', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `z_user_friends`
--
-- Создание: Сен 14 2016 г., 07:53
-- Последнее обновление: Сен 21 2016 г., 10:13
--

DROP TABLE IF EXISTS `z_user_friends`;
CREATE TABLE `z_user_friends` (
  `id` int(11) NOT NULL,
  `user_id` int(10) NOT NULL,
  `user_ch_id` int(10) NOT NULL,
  `block` int(1) NOT NULL,
  `look` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `z_atoms`
--
ALTER TABLE `z_atoms`
  ADD UNIQUE KEY `id` (`id`);

--
-- Индексы таблицы `z_msgs`
--
ALTER TABLE `z_msgs`
  ADD UNIQUE KEY `id` (`id`);

--
-- Индексы таблицы `z_users`
--
ALTER TABLE `z_users`
  ADD UNIQUE KEY `id` (`id`);

--
-- Индексы таблицы `z_user_friends`
--
ALTER TABLE `z_user_friends`
  ADD UNIQUE KEY `id` (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `z_atoms`
--
ALTER TABLE `z_atoms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=227;
--
-- AUTO_INCREMENT для таблицы `z_msgs`
--
ALTER TABLE `z_msgs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=230;
--
-- AUTO_INCREMENT для таблицы `z_users`
--
ALTER TABLE `z_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT для таблицы `z_user_friends`
--
ALTER TABLE `z_user_friends`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
