import { createColumnHelper } from '@tanstack/react-table';

export const classData = {
    1: ['writing','reading'],
    2: ['quran', 'fiqh', 'aqeeda', 'lisan', 'aqlaq'],
    3: ['quran', 'fiqh', 'aqeeda', 'lisan', 'aqlaq', 'tariq', 'tajvid'],
    4: ['quran', 'fiqh', 'aqeeda', 'lisan', 'aqlaq', 'tariq', 'tajvid'],
    5: ['quran', 'fiqh', 'aqeeda', 'lisan', 'aqlaq', 'tariq', 'tajvid'],
    6: ['quran', 'fiqh', 'tariq', 'durus', 'lisan'],
    7: ['quran', 'fiqh', 'tariq', 'durus', 'lisan'],
    8: ['fiqh', 'tariq', 'durus', 'lisan'],
    9: ['fiqh', 'tariq', 'durus', 'lisan'],
    10: ['fiqh', 'tafsir', 'durus', 'lisan'],
    11: ['fiqh', 'tafsir', 'durus', 'lisan'],
    12: ['fiqh', 'tafsir', 'durus', 'lisan']
}

const columnHelper = createColumnHelper();

export const tableHeaders = { 
    1: [
        columnHelper.accessor('id', {
            header: 'Reg No.',
          }),
          columnHelper.accessor('name', {
            header: 'Name',
          }),
          columnHelper.accessor('writing', {
            header: 'Writing',
          }),
          columnHelper.accessor('reading', {
            header: 'Reading',
          }),
    ],

    2: [
        columnHelper.accessor('id', {
          header: 'Reg No.',
        }),
        columnHelper.accessor('name', {
          header: 'Name',
        }),
        columnHelper.accessor('quran', {
          header: "Qur'an",
        }),
        columnHelper.accessor('fiqh', {
          header: 'Fiqh',
        }),
        columnHelper.accessor('aqeeda', {
          header: 'Aqeeda',
        }),
        columnHelper.accessor('lisan', {
          header: 'Lis.Qur',
        }),
        columnHelper.accessor('aqlaq', {
            header: 'Aqlaq',
          }),
    ],

    3: [
        columnHelper.accessor('id', {
          header: 'Reg No.',
        }),
        columnHelper.accessor('name', {
          header: 'Name',
        }),
        columnHelper.accessor('quran', {
          header: "Qur'an",
        }),
        columnHelper.accessor('fiqh', {
          header: 'Fiqh',
        }),
        columnHelper.accessor('aqeeda', {
          header: 'Aqeeda',
        }),
        columnHelper.accessor('lisan', {
          header: 'Lis.Qur',
        }),
        columnHelper.accessor('aqlaq', {
            header: 'Aqlaq',
        }),
        columnHelper.accessor('tariq', {
          header: 'Tariq',
        }),
        columnHelper.accessor('tajvid', {
            header: 'Tajvid',
        }),
    ],

    6: [
        columnHelper.accessor('id', {
          header: 'Reg No.',
        }),
        columnHelper.accessor('name', {
          header: 'Name',
        }),
        columnHelper.accessor('quran', {
            header: "Qur'an",
          }),
        columnHelper.accessor('fiqh', {
          header: 'Fiqh',
        }),
        columnHelper.accessor('tariq', {
          header: 'Tariq',
        }),
        columnHelper.accessor('lisan', {
          header: 'Lis.Qur',
        }),
        columnHelper.accessor('durus', {
          header: 'Dur.Ihsan',
        }),
    ],

    8: [
        columnHelper.accessor('id', {
          header: 'Reg No.',
        }),
        columnHelper.accessor('name', {
          header: 'Name',
        }),
        columnHelper.accessor('fiqh', {
          header: 'Fiqh',
        }),
        columnHelper.accessor('tariq', {
          header: 'Tariq',
        }),
        columnHelper.accessor('lisan', {
          header: 'Lis.Qur',
        }),
        columnHelper.accessor('durus', {
          header: 'Dur.Ihsan',
        }),
    ],

    10: [
        columnHelper.accessor('id', {
          header: 'Reg No.',
        }),
        columnHelper.accessor('name', {
          header: 'Name',
        }),
        columnHelper.accessor('fiqh', {
          header: 'Fiqh',
        }),
        columnHelper.accessor('tafsir', {
          header: 'Tafsir',
        }),
        columnHelper.accessor('lisan', {
          header: 'Lis.Qur',
        }),
        columnHelper.accessor('durus', {
          header: 'Dur.Ihsan',
        }),
    ],
};
