

function tampilkanHalaman(idHalaman){
    let semuaHalaman = document.querySelectorAll('.halaman')

    semuaHalaman.forEach((hilang) => {
        hilang.style.display = 'none';
    });

    document.getElementById(idHalaman).style.display = 'block';
}


function formatRupiah(element) {
  // 1. Ambil value, hapus semua karakter selain angka
  let value = element.value.replace(/[^0-9]/g, '');
  
  // 2. Ubah angka menjadi format dengan pemisah titik
  let formatted = new Intl.NumberFormat('id-ID').format(value);
  
  // 3. Jika input kosong, bersihkan kolom. Jika berisi, masukkan hasil format
  element.value = value === '' ? '' : formatted;
}

// Ambil elemen tombol tab dan form
const btnPemasukan = document.getElementById('tambahtambah');
const btnPengeluaran = document.getElementById('kurangkurang');
const wadahFormInput = document.getElementById('notif-tambahkan'); // Ganti dengan ID form/modal kamu

// 1. PAS TOMBOL PEMASUKAN DIKLIK
btnPemasukan.addEventListener('click', () => {
    // Logika kamu buat munculin tab input (misal diubah display-nya atau tambah class)
    wadahFormInput.style.display = 'block'; 

    // Kirim sinyal ke file module bawa data 'data-masuk'
    const sinyal = new CustomEvent('gantiForm', { detail: 'data-masuk' });
    window.dispatchEvent(sinyal);
});

// 2. PAS TOMBOL PENGELUARAN DIKLIK
btnPengeluaran.addEventListener('click', () => {
    // Logika munculin tab input
    wadahFormInput.style.display = 'block'; 
    
    // Kirim sinyal ke file module bawa data 'data-keluar'
    const sinyal = new CustomEvent('gantiForm', { detail: 'data-keluar' });
    window.dispatchEvent(sinyal);
});


const keluarinput = document.querySelector('.keluarTambahkan')
keluarinput.addEventListener('click', ()=>{
    
    wadahFormInput.style.display = 'none'; 
})




