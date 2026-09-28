# Panduan Belajar HTTP Methods (GET, POST, PUT, DELETE)

File ini dibuat khusus untuk belajar dan memahami cara kerja komunikasi dengan API/Server.

---

## 1. GET (Mengambil Data)
- **Gunanya**: Untuk meminta/mengambil data dari server (hanya membaca, tidak mengubah data).
- **Analogi**: Seperti kamu meminta buku dari perpustakaan untuk dibaca.

```javascript
async function belajarGET() {
    console.log("Mulai melakukan GET request...");

    // fetch() digunakan untuk melakukan request ke internet/server.
    // Secara default, jika tidak ditulis method-nya, fetch akan menggunakan method 'GET'.
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    
    // response.json() berfungsi untuk mengubah balasan dari server (yang biasanya berupa teks/string) 
    // menjadi format JSON (Objek JavaScript) agar mudah kita baca dan gunakan di kode.
    const data = await response.json();
    
    // Menampilkan hasil yang didapat dari server ke console
    console.log("Hasil GET:", data);
}
```

---

## 2. POST (Mengirim/Membuat Data Baru)
- **Gunanya**: Untuk mengirim data baru ke server agar disimpan (membuat data baru).
- **Analogi**: Seperti kamu menyerahkan formulir pendaftaran anggota baru ke perpustakaan.

```javascript
async function belajarPOST() {
    console.log("Mulai melakukan POST request...");

    // Ini adalah data yang ingin kita kirim ke server
    const dataBaru = {
        title: 'Belajar API',
        body: 'Ini adalah contoh mengirim data dengan POST',
        userId: 1,
    };

    // Saat melakukan POST, kita harus menambahkan pengaturan/opsi pada parameter kedua dari fetch()
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST', // Menentukan bahwa kita menggunakan method POST
        
        headers: {
            // Headers berguna untuk memberi informasi tambahan ke server.
            // Memberitahu server: "Hei server, data yang aku kirim formatnya JSON lho!"
            'Content-Type': 'application/json',
        },
        
        // Data berbentuk objek JavaScript TIDAK BISA langsung dikirim lewat internet.
        // JSON.stringify() mengubah objek menjadi string/teks biasa agar bisa dikirim.
        body: JSON.stringify(dataBaru) 
    });

    // Mengambil balasan dari server setelah data berhasil dibuat
    const balasanServer = await response.json();
    console.log("Hasil POST:", balasanServer);
}
```

---

## 3. PUT (Memperbarui Data yang Sudah Ada)
- **Gunanya**: Untuk memperbarui/menimpa data lama di server dengan data baru secara keseluruhan.
- **Analogi**: Seperti kamu menukar bukumu yang rusak dengan buku yang sama persis tapi kondisinya baru.

```javascript
async function belajarPUT() {
    console.log("Mulai melakukan PUT request...");

    const dataUpdate = {
        id: 1, // ID ini penting agar server tahu data nomor berapa yang harus diubah
        title: 'Judul Baru (Telah Diupdate)',
        body: 'Isi artikel telah diperbarui menggunakan metode PUT',
        userId: 1,
    };

    // Biasanya berakhiran dengan ID dari data yang mau diupdate (contoh: /posts/1)
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'PUT', // Menentukan bahwa kita menggunakan method PUT
        
        headers: {
            'Content-Type': 'application/json',
        },
        
        body: JSON.stringify(dataUpdate) // Sama seperti POST, data harus diubah jadi string
    });

    const balasanServer = await response.json();
    console.log("Hasil PUT:", balasanServer);
}
```

---

## 4. DELETE (Menghapus Data)
- **Gunanya**: Untuk meminta server menghapus suatu data.
- **Analogi**: Seperti kamu meminta pustakawan untuk menghapus namamu dari daftar anggota.

```javascript
async function belajarDELETE() {
    console.log("Mulai melakukan DELETE request...");

    // URL spesifik menunjuk ke ID data yang mau dihapus (contoh: /posts/1)
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'DELETE', // Menentukan method DELETE
    });

    // Biasanya, request DELETE tidak mengembalikan data. Kita mengecek response.ok.
    if (response.ok) {
        console.log("Data berhasil dihapus!");
    } else {
        console.log("Gagal menghapus data.");
    }
}
```
