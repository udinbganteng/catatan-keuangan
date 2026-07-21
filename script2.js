import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    onSnapshot,
    increment,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAfsHc3iVBHwJa5hrIUrVuzWW3QzimV5Fk",
    authDomain: "catatan-keuangan-2644f.firebaseapp.com",
    projectId: "catatan-keuangan-2644f",
    storageBucket: "catatan-keuangan-2644f.firebasestorage.app",
    messagingSenderId: "768508454027",
    appId: "1:768508454027:web:7999cfccca910c57dca08e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================================================
// DATA KATEGORI MANDIRI (LOKAL)
// ===================================================
// Bebas kamu tambah, edit, atau kurangin langsung dari sini ya, coy!
const daftarKategori = [
    // --- KATEGORI PENGELUARAN (data-keluar) ---
    { id: "makan", nama: "Makanan & Minuman", ikon: "🍔", jenis: "data-keluar" },
    { id: "transport", nama: "Transportasi", ikon: "🚗", jenis: "data-keluar" },
    { id: "parkir", nama: "Transportasi", ikon: "🚗", jenis: "data-keluar" },
    { id: "jajan", nama: "Jajan & Cemilan", ikon: "🍩", jenis: "data-keluar" },
    { id: "rutin", nama: "Tagihan Bulanan", ikon: "💵", jenis: "data-keluar" },

    // --- KATEGORI PEMASUKAN (data-masuk) ---
    { id: "jajan", nama: "Uang Jajan", ikon: "💼", jenis: "data-masuk" },
    { id: "transfer", nama: "Kiriman / Transfer", ikon: "📱", jenis: "data-masuk" },
    { id: "kuota", nama: "bayaran kuota", ikon: "📶", jenis: "data-masuk" },
    { id: "sampingan", nama: "Proyek / Freelance", ikon: "🖥️", jenis: "data-masuk" },

    // --- KATEGORI UMUM (Bisa muncul di dua-duanya atau kasih 'lainnya') ---
    { id: "lainnya", nama: "Lainnya", ikon: "🪙", jenis: "semua" }
];

// Taruh di bawah variabel kategoriTerpilih kamu
let kategoriTerpilih = '';
let jenisTransaksiAktif = 'data-keluar'; // Default awal kita set pengeluaran
const tempatKategori = document.getElementById('kategori');

const sekarang = new Date();
const formatBulan = `${sekarang.getFullYear()}-${String(sekarang.getMonth() + 1).padStart(2, '0')}`;
const alamatrekap = doc(db, 'keuangan', formatBulan);

// Fungsi muat kategori dari data objek lokal (0 Read Firebase!)
// Tambahkan parameter 'jenisForm' (isinya nanti antara 'data-masuk' atau 'data-keluar')
export function muatKategori(jenisForm) {
    if (!tempatKategori) return;
    tempatKategori.innerHTML = '';

    // FILTER: Cuma ambil kategori yang jenisnya cocok, atau yang jenisnya 'semua'
    const kategoriTersaring = daftarKategori.filter(kat => kat.jenis === jenisForm || kat.jenis === "semua");

    // Loop data yang udah disaring aja
    kategoriTersaring.forEach((kat) => {
        const tombol = document.createElement('button');
        tombol.type = 'button';
        tombol.className = 'kategori-card';
        tombol.textContent = `${kat.ikon} ${kat.nama}`;

        tempatKategori.appendChild(tombol);

        tombol.addEventListener('click', () => {
            const semuaTombol = tempatKategori.querySelectorAll('.kategori-card');
            semuaTombol.forEach(t => t.classList.remove('aktif'));

            tombol.classList.add('aktif');
            kategoriTerpilih = kat.id;
            console.log("Kategori terpilih:", kategoriTerpilih);
        });
    });
}

// Jalankan fungsi cetak tombol kategori
muatKategori('data-keluar');


// ===================================================
// TAMBAHKAN KE DATABASE
// ===================================================
async function simpanMasukKeDatabase() {
    const inputuang = document.getElementById('jumlahUang');
    const inputTanggal = document.getElementById('tanggal');
    const inputKeterangan = document.getElementById('keterangan');

    const angkaMurni = inputuang.value.replace(/[^0-9]/g, '');
    const nominal = Number(angkaMurni);

    const tanggal = inputTanggal.value;
    const keterangan = inputKeterangan.value;

    if (!nominal || nominal < 0) {
        alert('Nominal harus diisi dengan benar!');
        return;
    }
    if (kategoriTerpilih === '') {
        alert('Kategori harus dipilih!');
        return;
    }
    if (!tanggal) {
        alert('Tanggal harus diisi!');
        return;
    }

    try {
        await addDoc(collection(db, "keuangan"), {
            jumlah: nominal,
            kategori: kategoriTerpilih,
            jenis: jenisTransaksiAktif, // 👈 SEKARANG DINAMIS (bisa data-masuk / data-keluar)
            keterangan: keterangan,
            waktuDibuat: new Date()
        });

        // Logika update rekap bulanan otomatis menyesuaikan jenisnya
        const dataRekap = {};
        if (jenisTransaksiAktif === 'data-masuk') {
            dataRekap.uang_masuk = increment(nominal);
        } else {
            dataRekap.uang_keluar = increment(nominal);
        }

        await setDoc(alamatrekap, dataRekap, { merge: true });

        alert('Berhasil disimpan');

        inputuang.value = '';
        inputTanggal.value = '';
        inputKeterangan.value = '';
        kategoriTerpilih = '';

        const semuaTombol = tempatKategori.querySelectorAll('.kategori-card');
        semuaTombol.forEach(btn => btn.classList.remove('aktif'));

        muatCatatanAwal();
    } catch (error) {
        alert('Gagal disimpan');
        console.error('Gagal disimpan', error);
    }
}

const tombolSimpan = document.querySelector('.simpan');
if (tombolSimpan) tombolSimpan.addEventListener('click', simpanMasukKeDatabase);

async function simpankeluar() {
    // Kosong untuk pengembangan kamu nanti
}


// ===================================================
// MUAT RIWAYAT HALAMAN UTAMA (PAGINATION)
// ===================================================
const wadahCatatan = document.getElementById('wadah');
const btnLoadMore = document.getElementById('btnMuatLebih');
let dokumenTerakhir = null;
const LIMIT_DATA = 10;

function muatkeRiwayat(querySnapshot, isAppend = false) {
    if (!isAppend) wadahCatatan.innerHTML = '';

    querySnapshot.forEach((dok) => {
        const transaksi = dok.data();
        const itemCatatan = document.createElement('li');
        itemCatatan.className = 'card-data';

        const formatUang = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(transaksi.jumlah);

        let teksWaktu = "";
        if (transaksi.waktuDibuat) {
            const dateObjek = transaksi.waktuDibuat.toDate();
            const jam = String(dateObjek.getHours()).padStart(2, '0');
            const menit = String(dateObjek.getMinutes()).padStart(2, '0');
            teksWaktu = `${jam}:${menit}`;
        }

        // Cari info lengkap kategori (nama & ikon) dari data objek lokal berdasarkan ID yang tersimpan
        const detailKat = daftarKategori.find(k => k.id === transaksi.kategori) || { nama: "Lainnya", ikon: "🪙" };

        itemCatatan.innerHTML = `
                    <div>
                        <h3>${detailKat.ikon} ${detailKat.nama}</h3>
                        <p>${transaksi.keterangan || '-'}</p>
                    </div>
                    <div>
                        <span id="${transaksi.jenis}">${formatUang}</span>
                        <p class="data-waktu">⏰ ${teksWaktu}</p> 
                    </div>
        `;
        wadahCatatan.appendChild(itemCatatan);
    });
}

async function muatCatatanAwal() {
    if (!wadahCatatan) return;
    wadahCatatan.innerHTML = '<p style="text-align: center;">Memuat riwayat...</p>';
    if (btnLoadMore) btnLoadMore.style.display = 'none';

    try {
        const q = query(
            collection(db, "keuangan"),
            orderBy("waktuDibuat", "desc"),
            limit(LIMIT_DATA)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            wadahCatatan.innerHTML = '<p style="color: gray; text-align: center;">Belum ada transaksi.</p>';
            return;
        }

        muatkeRiwayat(querySnapshot, false);
        dokumenTerakhir = querySnapshot.docs[querySnapshot.docs.length - 1];

        if (btnLoadMore) {
            if (querySnapshot.docs.length === LIMIT_DATA) {
                btnLoadMore.style.display = 'block';
            } else {
                btnLoadMore.style.display = 'none';
            }
        }

    } catch (error) {
        console.error("Gagal memuat data awal:", error);
    }
}

async function muatDataBerikutnya() {
    if (!dokumenTerakhir || !btnLoadMore) return;

    btnLoadMore.innerText = "Memuat...";
    btnLoadMore.disabled = true;

    try {
        const q = query(
            collection(db, "keuangan"),
            orderBy("waktuDibuat", "desc"),
            startAfter(dokumenTerakhir),
            limit(LIMIT_DATA)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            btnLoadMore.style.display = 'none';
            alert("Semua riwayat sudah ditampilkan!");
            return;
        }

        muatkeRiwayat(querySnapshot, true);
        dokumenTerakhir = querySnapshot.docs[querySnapshot.docs.length - 1];

        if (querySnapshot.docs.length < LIMIT_DATA) {
            btnLoadMore.style.display = 'none';
        } else {
            btnLoadMore.innerText = "Muat Lebih Banyak";
            btnLoadMore.disabled = false;
        }

    } catch (error) {
        console.error("Gagal muat data berikutnya:", error);
    }
}

muatCatatanAwal();
if (btnLoadMore) btnLoadMore.addEventListener('click', muatDataBerikutnya);


// ===================================================
// SALDO REALTIME (INCOME & EXPENSE)
// ===================================================
const alamat = collection(db, 'keuangan');
let saldo = 0;

onSnapshot(alamatrekap, (dok) => {
    if (dok.exists()) {
        const data = dok.data();
        const masuk = data.uang_masuk || 0;
        const keluar = data.uang_keluar || 0;
        saldo = masuk - keluar;

        document.getElementById('saldo-atas').innerText = `Rp ${saldo.toLocaleString('id-ID')}`;
        document.getElementById('uang-masuk').innerText = `Rp ${masuk.toLocaleString('id-ID')}`;
        document.getElementById('uang-keluar').innerText = `Rp ${keluar.toLocaleString('id-ID')}`;
    } else {
        document.getElementById('saldo-atas').innerText = `Rp0`;
        document.getElementById('uang-masuk').innerText = `Rp0`;
        document.getElementById('uang-keluar').innerText = `Rp0`;
    }
});


// ===================================================
// REALTIME PANTAL 4 TRANSAKSI TERBARU (DASHBOARD)
// ===================================================
const riwayat4 = query(
    alamat,
    orderBy('waktuDibuat', 'desc'),
    limit(4)
);

onSnapshot(riwayat4, (snap) => {
    const listRiwayat = document.getElementById('data-terkini');
    if (!listRiwayat) {
        console.error('ID container list terkini ga ketemu coy');
        return;
    }

    listRiwayat.innerHTML = '';

    snap.forEach((dok) => {
        const transaksi = dok.data();
        if (!transaksi.waktuDibuat) return;

        const waktubaru = transaksi.waktuDibuat.toDate();
        const jam = String(waktubaru.getHours()).padStart(2, '0');
        const menit = String(waktubaru.getMinutes()).padStart(2, '0');
        const formatwaktu = `${jam}:${menit}`;

        // COCOKKAN ID KATEGORI DENGAN DATA OBJEK LOKAL DI SINI JUGA COY 👇
        const detailKat = daftarKategori.find(k => k.id === transaksi.kategori) || { nama: "Lainnya", ikon: "🪙" };

        listRiwayat.innerHTML += `
            <li class="data1 card-data">
                <h3>${detailKat.ikon} ${transaksi.keterangan || detailKat.nama}</h3>
                <div>
                    <span class="${transaksi.jenis}">Rp ${transaksi.jumlah.toLocaleString('id-ID')}</span>
                    <p class="data-waktu">⏰ ${formatwaktu}</p>
                </div>
            </li>
        `;
    });
});


// Dengerin sinyal 'gantiForm' dari file script.js biasa
window.addEventListener('gantiForm', (e) => {
    const jenisFormBerdasarKlik = e.detail; // Isinya 'data-masuk' atau 'data-keluar'
    
    // 1. Update status jenis transaksi yang aktif saat ini
    jenisTransaksiAktif = jenisFormBerdasarKlik; 
    
    // 2. Reset kategori terpilih sebelumnya biar gak tabrakan
    kategoriTerpilih = ''; 

    // 3. Panggil fungsi muatKategori() yang udah kita bikin kemarin buat nyaring tombolnya!
    muatKategori(jenisFormBerdasarKlik); 
    
    console.log("Sistem mendeteksi form beralih ke:", jenisTransaksiAktif);
});