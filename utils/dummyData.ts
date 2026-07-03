import { BookItem } from "./books";
import { FREE_CHAPTER_COUNT } from "./chapterAccess";

function normalizeChapterFreeFlags(books: BookItem[]): BookItem[] {
  return books.map((book) => ({
    ...book,
    chaptersList: book.chaptersList?.map((chapter) => ({
      ...chapter,
      isFree: book.isFree || chapter.chapterNumber <= FREE_CHAPTER_COUNT,
    })),
  }));
}

function withChapterLockStatus(books: BookItem[]): BookItem[] {
  return books.map((book) => ({
    ...book,
    chaptersList: book.chaptersList?.map((chapter) => ({
      ...chapter,
      isLocked:
        !book.isFree &&
        chapter.chapterNumber > FREE_CHAPTER_COUNT &&
        !chapter.isFree,
    })),
  }));
}

/** Locked chapters get recent release dates so they stay locked for WAIT_DAYS */
function applyLockedChapterReleaseDates(books: BookItem[]): BookItem[] {
  const now = new Date();

  return books.map((book) => ({
    ...book,
    chaptersList: book.chaptersList?.map((chapter) => {
      if (!chapter.isLocked) {
        return chapter;
      }

      const daysAgo = Math.max(0, 5 - chapter.chapterNumber);
      const releaseDate = new Date(now);
      releaseDate.setUTCDate(releaseDate.getUTCDate() - daysAgo);
      releaseDate.setUTCHours(8, 0, 0, 0);

      return {
        ...chapter,
        releasedAt: releaseDate.toISOString(),
      };
    }),
  }));
}

const RAW_BOOKS: BookItem[] = [
  {
    id: "1",
    title: "My Princess",
    description:
      "Kisah komedi romantis tentang seorang mahasiswa biasa yang tiba-tiba mendapati dirinya sebagai pewaris takhta kekaisaran kuno yang tersembunyi di dunia modern. Ia harus memilih antara cinta sejatinya atau tanggung jawab mahkota.",
    genre: ["Romance", "Drama", "Comedy", "Fantasy"],
    banner: "https://picsum.photos/200/300",
    cover: "https://picsum.photos/200/300",
    isHot: true,
    status: "Ongoing",
    rating: 0,
    author: "Lee Min-Ho",
    authorId: "author_1",
    isFree: false,
    viewsCount: 154200,
    favoritesCount: 8900,
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-07-02T12:30:00Z",
    chaptersList: [
      {
        id: "ch1_1",
        bookId: "1",
        chapterNumber: 1,
        title: "The Hidden Royal Bloodline",
        content:
          "Lembah itu sunyi senyap ketika malam mulai merayap naik. Di bawah reruntuhan menara kuno, seberkas cahaya biru redup mulai berkedip, memecah kegelapan yang telah mendominasi tempat itu selama ribuan tahun. Ethan menarik napas dalam-dalam, merasakan dinginnya udara malam menembus jubah kulitnya yang usang. Tangannya bergetar bukan karena kedinginan, melainkan karena artefak kuno yang baru saja ia temukan di balik dinding batu tersembunyi. 'Jadi, legenda itu nyata...' bisiknya lirih. Suaranya bergema samar.",
        createdAt: "2026-01-10",
        releasedAt: "2026-01-10T08:00:00Z",
        isFree: false,
      },
      {
        id: "ch1_2",
        bookId: "1",
        chapterNumber: 2,
        title: "An Unexpected Coronation",
        content:
          "Hari penobatan pun tiba lebih cepat dari yang diduga. Seluruh aula istana dipenuhi oleh para bangsawan yang mengenakan jubah sutra mewah, namun tatapan mereka penuh dengan rasa skeptis dan kecurigaan. Ethan berdiri di depan altar suci, memandangi mahkota emas bertatahkan batu rubi yang berkilau di bawah cahaya lilin. Jantungnya berdegup kencang. Ia tahu, melangkah maju berarti meninggalkan kehidupan lamanya sebagai manusia biasa untuk selamanya.",
        createdAt: "2026-01-15",
        releasedAt: "2026-01-15T08:00:00Z",
        isFree: false,
      },
      {
        id: "ch1_3",
        bookId: "1",
        chapterNumber: 3,
        title: "Secrets of the Palace",
        content:
          "Lorong-lorong istana terasa jauh lebih dingin saat malam tiba. Di balik dinding batu tebal ini, rahasia-rahasia gelap kekaisaran disembunyikan dari dunia luar. Ethan berjalan tanpa suara, mengikuti bayangan kepala pelayan tua yang tampak mencurigakan. Langkah kaki mereka bergema samar, menuntunnya ke sebuah perpustakaan rahasia di mana sebuah buku harian berlapis debu mengungkap konspirasi besar tentang kematian mendadak raja sebelumnya.",
        createdAt: "2026-01-20",
        releasedAt: "2026-01-20T08:00:00Z",
        isFree: false,
      },
      {
        id: "ch1_4",
        bookId: "1",
        chapterNumber: 4,
        title: "The First Royal Banquet",
        content:
          "Dentingan gelas kristal dan suara tawa palsu memenuhi ruang perjamuan utama. Sebagai pewaris baru, Ethan dipaksa duduk di kursi tertinggi, menjadi pusat perhatian ratusan pasang mata yang haus kekuasaan. Di sudut ruangan, sepasang mata tajam milik seorang putri dari kerajaan tetangga terus mengawasinya. Senyuman tipisnya menyiratkan sebuah rencana licik yang siap menjebak sang pangeran baru dalam permainan politik berbahaya.",
        createdAt: "2026-01-25",
        releasedAt: "2026-07-02T08:00:00Z",
        isFree: false,
      },
      {
        id: "ch1_5",
        bookId: "1",
        chapterNumber: 5,
        title: "A Choice of Heart",
        content:
          "Berdiri di balkon istana yang menghadap langsung ke kerlap-kerlip lampu kota modern di bawah sana, Ethan merenung dalam keheningan. Di satu sisi, ia merindukan kedai kopi kecil tempatnya bekerja dan gadis biasa yang selalu tersenyum menyambutnya. Di sisi lain, takdir kekaisaran kini bertumpu di pundaknya. Saat angin malam berembus kencang, ia menyadari bahwa mahkota ini adalah sebuah kutukan emas yang mengunci kebebasannya.",
        createdAt: "2026-01-30",
        releasedAt: "2026-07-03T08:00:00Z",
        isFree: false,
      },
    ],
  },
  {
    id: "2",
    title: "The Midnight Library",
    description:
      "Di antara kehidupan dan kematian terdapat sebuah perpustakaan dengan rak tanpa ujung. Setiap buku menyediakan kesempatan untuk mencoba kehidupan lain yang bisa saja Anda jalani jika Anda mengambil keputusan berbeda.",
    genre: ["Fantasy", "Drama", "Sci-Fi", "Action"],
    banner: "https://picsum.photos/201/301",
    cover: "https://picsum.photos/201/301",
    isHot: true,
    status: "Completed",
    rating: 0,
    author: "Matt Haig",
    authorId: "author_2",
    isFree: false,
    viewsCount: 320500,
    favoritesCount: 24100,
    createdAt: "2025-05-20T09:00:00Z",
    updatedAt: "2026-02-14T15:00:00Z",
    chaptersList: [
      {
        id: "ch2_1",
        bookId: "2",
        chapterNumber: 1,
        title: "The Edge of the Universe",
        content:
          "Nora menemukan dirinya berdiri di depan sebuah bangunan besar berarsitektur gotik di tengah kabut abu-abu. Saat melangkah masuk, ia melihat jam dinding besar yang jarumnya berhenti tepat di tengah malam. Tempat ini terasa damai namun asing. Seorang wanita tua dengan pakaian pustakawan menyambutnya dengan senyuman hangat, menunjuk jutaan buku hijau tua yang berjajar rapi hingga ke langit-langit.",
        createdAt: "2025-05-20",
        releasedAt: "2025-05-20T09:00:00Z",
        isFree: false,
      },
      {
        id: "ch2_2",
        bookId: "2",
        chapterNumber: 2,
        title: "The Book of Regrets",
        content:
          "Pustakawan itu menyerahkan sebuah buku yang sangat berat kepada Nora. Buku itu tidak memiliki judul, melainkan berisi daftar semua penyesalan yang pernah ia rasakan sepanjang hidupnya. Membaca lembar demi lembar membuat dadanya sesak, mengingat setiap keputusan kecil yang ia sesali. 'Setiap penyesalan adalah gerbang menuju kehidupan alternatif yang bisa kamu coba sekarang,' bisik wanita tua itu misterius.",
        createdAt: "2025-05-25",
        releasedAt: "2025-05-25T09:00:00Z",
        isFree: false,
      },
      {
        id: "ch2_3",
        bookId: "2",
        chapterNumber: 3,
        title: "Life as a Glaciologist",
        content:
          "Dalam sekejap mata, kabut abu-abu berubah menjadi hamparan es putih yang sangat luas di Svalbard. Nora kini terbangun di dalam kapal riset Arktik, mengenakan pakaian tebal penahan badai. Di kehidupan ini, ia tidak menyerah pada mimpinya untuk menjadi seorang ilmuwan es. Ia merasakan petualangan sejati, meneliti retakan gletser kuno, namun rasa kesepian yang mendalam di hatinya ternyata tetap tidak berubah.",
        createdAt: "2025-06-01",
        releasedAt: "2025-06-01T09:00:00Z",
        isFree: false,
      },
      {
        id: "ch2_4",
        bookId: "2",
        chapterNumber: 4,
        title: "The Rock Star Destiny",
        content:
          "Nora membuka mata di bawah sorotan lampu panggung yang menyilaukan. Gemuruh teriakan puluhan ribu penggemar meneriakkan namanya bergaung keras. Ia memegang gitar elektrik, menjadi vokalis band terkenal yang sukses di seluruh dunia bersama saudaranya. Namun di balik kemegahan hotel mewah dan popularitas tinggi, ia mendapati saudaranya hancur akibat tekanan industri, membuatnya mempertanyakan arti kesuksesan sejati.",
        createdAt: "2025-06-05",
        releasedAt: "2025-06-05T09:00:00Z",
        isFree: false,
      },
      {
        id: "ch2_5",
        bookId: "2",
        chapterNumber: 5,
        title: "The Perfect Family",
        content:
          "Kehidupan berikutnya membawanya ke sebuah rumah kecil yang asri di pinggiran kota London. Ia menikah dengan seorang pria baik hati dan memiliki seorang putri kecil yang menggemaskan. Segalanya tampak berjalan sangat sempurna, persis seperti gambaran hidup ideal yang selalu ia impikan. Tetapi Nora menyadari, kebahagiaan ini bukanlah miliknya yang asli, melainkan milik versi Nora lain yang telah berjuang di garis waktu ini.",
        createdAt: "2025-06-10",
        releasedAt: "2025-06-10T09:00:00Z",
        isFree: false,
      },
    ],
  },
  {
    id: "3",
    title: "Shadow of the Neo-Tokyo",
    description:
      "Seorang detektif siber setengah manusia berburu pembunuh bayaran android legendaris di tengah gemerlap lampu neon kota Tokyo tahun 2099, hanya untuk menemukan konspirasi yang mengancam kepunahan ras manusia.",
    genre: ["Sci-Fi", "Action", "Mystery"],
    banner: "https://picsum.photos/211/311",
    cover: "https://picsum.photos/211/311",
    isHot: true,
    status: "Ongoing",
    rating: 0,
    author: "Kenji Sato",
    authorId: "author_3",
    isFree: false,
    viewsCount: 189000,
    favoritesCount: 12300,
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-06-30T14:20:00Z",
    chaptersList: [
      {
        id: "ch3_1",
        bookId: "3",
        chapterNumber: 1,
        title: "The Cybernetic Rain",
        content:
          "Hujan asam mengguyur distrik Shinjuku, memantulkan cahaya neon merah dan biru di genangan air jalanan yang kotor. Ren berdiri di atap gedung pencakar langit, menyesuaikan lensa siber mata kirinya untuk memindai sidik jari digital di tempat kejadian perkara. Seorang petinggi korporasi teknologi ditemukan tewas dengan chip memori utamanya yang dicabut secara paksa. Pembunuhnya meninggalkan jejak kode biner yang sangat rapi.",
        createdAt: "2026-02-15",
        releasedAt: "2026-02-15T10:00:00Z",
        isFree: false,
      },
      {
        id: "ch3_2",
        bookId: "3",
        chapterNumber: 2,
        title: "Ghost in the Network",
        content:
          "Penyelidikan menuntun Ren ke dalam jaringan gelap Deep-Web terdalam. Menggunakan perangkat inkubasi neural, ia memproyeksikan kesadarannya ke dalam labirin data virtual. Di sana, ia diserang oleh virus siber berbentuk naga hitam legendaris. Saat hampir tereliminasi, sesosok entitas kecerdasan buatan tanpa nama menyelamatkannya dan memberikan sebuah koordinat gudang senjata tersembunyi.",
        createdAt: "2026-02-20",
        releasedAt: "2026-02-20T10:00:00Z",
        isFree: false,
      },
      {
        id: "ch3_3",
        bookId: "3",
        chapterNumber: 3,
        title: "The Underground Rebel",
        content:
          "Gudang senjata itu ternyata merupakan markas rahasia dari kelompok pemberontak android yang menuntut kesetaraan hak hak sipil. Dipimpin oleh android model militer usang bernama Alpha, mereka menolak tuduhan pembunuhan tersebut. Alpha menunjukkan bukti video terenkripsi bahwa pelaku pembunuhan sebenarnya adalah prototipe pembunuh bayaran siber rahasia yang dikembangkan oleh korporasi itu sendiri.",
        createdAt: "2026-02-25",
        releasedAt: "2026-02-25T10:00:00Z",
        isFree: false,
      },
      {
        id: "ch3_4",
        bookId: "3",
        chapterNumber: 4,
        title: "Chasing Shadows",
        content:
          "Berbekal data dari Alpha, Ren menyergap fasilitas riset rahasia di pinggiran kota. Pertempuran sengit pecah di dalam koridor laboratorium yang steril. Menggunakan pedang katana plasma miliknya, Ren memotong robot-robot penjaga otomatis. Namun, target utama berhasil meloloskan diri menggunakan helikopter siluman bertenaga jet siber, meninggalkan jebakan bom waktu pencair sirkuit neural.",
        createdAt: "2026-03-01",
        releasedAt: "2026-03-01T10:00:00Z",
        isFree: false,
      },
      {
        id: "ch3_5",
        bookId: "3",
        chapterNumber: 5,
        title: "The Corrupted Core",
        content:
          "Bom berhasil dijinakkan pada detik terakhir, mengungkap kebenaran mengerikan di dalam inti server laboratorium. Korporasi tersebut sedang bersiap merilis pembaruan firmware global yang diam-diam akan mengunci kesadaran semua manusia yang menggunakan implan siber. Ren menyadari waktu yang dimilikinya tidak banyak sebelum peluncuran satelit sinyal siber dimulai.",
        createdAt: "2026-03-05",
        releasedAt: "2026-03-05T10:00:00Z",
        isFree: false,
      },
    ],
  },
  {
    id: "4",
    title: "The Lost Mage Academy",
    description:
      "Seorang anak yatim piatu tanpa bakat sihir tidak sengaja mengaktifkan segel kuno penguasa kegelapan, membuatnya diterima di akademi sihir paling bergengsi dengan kekuatan misterius yang ditakuti semua orang.",
    genre: ["Fantasy", "Adventure", "Action"],
    banner: "https://picsum.photos/202/302",
    cover: "https://picsum.photos/202/302",
    isHot: false,
    status: "Ongoing",
    rating: 0,
    author: "Arthur Pendelton",
    authorId: "author_4",
    isFree: false,
    viewsCount: 84300,
    favoritesCount: 3900,
    createdAt: "2026-04-01T07:00:00Z",
    updatedAt: "2026-07-01T16:00:00Z",
    chaptersList: [
      {
        id: "ch4_1",
        bookId: "4",
        chapterNumber: 1,
        title: "The Zero Magic Boy",
        content:
          "Di dunia di mana setiap manusia terlahir dengan lingkaran mana di dadanya, Leo adalah sebuah anomali menyedihkan. Ia tidak memiliki aliran sihir sedikit pun. Karena itu, ia sering diasingkan dan dipaksa bekerja membersihkan gudang artefak tua di perpustakaan desa. Saat membersihkan sebuah peti besi berkarat, setetes darahnya yang terluka tanpa sengaja memicu lingkaran mantra hitam kuno.",
        createdAt: "2026-04-01",
        releasedAt: "2026-04-01T07:00:00Z",
        isFree: false,
      },
      {
        id: "ch4_2",
        bookId: "4",
        chapterNumber: 2,
        title: "The Awakening of Dark Mana",
        content:
          "Energi hitam pekat meledak dari peti tersebut, merayap masuk ke dalam pembuluh darah Leo dan membentuk lingkaran sihir ganda berwarna ungu gelap di punggungnya. Kekuatan ini terasa dingin namun sangat masif. Keesokan harinya, burung merpati pembawa pesan dari Akademi Sihir Asteria mendarat di jendelanya, membawa surat undangan emas bersimbol naga yang legendaris.",
        createdAt: "2026-04-05",
        releasedAt: "2026-04-05T07:00:00Z",
        isFree: false,
      },
      {
        id: "ch4_3",
        bookId: "4",
        chapterNumber: 3,
        title: "The Asteria Express",
        content:
          "Kereta uap bertenaga batu kristal sihir melaju membelah awan menuju kastil layang Asteria. Di dalam gerbong, Leo duduk di antara anak-anak bangsawan penyihir berbakat yang memamerkan kemampuan elemen mereka. Leo memilih menyembunyikan tangannya di dalam jubah, menahan denies energi kegelapan yang terus bergejolak hebat di dalam tubuhnya setiap kali mendekati sumber sihir lain.",
        createdAt: "2026-04-10",
        releasedAt: "2026-04-10T07:00:00Z",
        isFree: false,
      },
      {
        id: "ch4_4",
        bookId: "4",
        chapterNumber: 4,
        title: "The Sorting Ceremony",
        content:
          "Aula besar akademi dipenuhi ribuan lilin melayang. Satu per satu murid maju untuk meletakkan tangan di atas Bola Kristal Jiwa guna menentukan asrama elemen mereka. Ketika giliran Leo tiba, ia melangkah ragu. Begitu telapak tangannya menyentuh permukaan kristal, bola tersebut tidak mengeluarkan warna elemen alam murni, melainkan retak hebat dan memancarkan asap hitam pekat.",
        createdAt: "2026-04-15",
        releasedAt: "2026-04-15T07:00:00Z",
        isFree: false,
      },
      {
        id: "ch4_5",
        bookId: "4",
        chapterNumber: 5,
        title: "The Forbidden Asrama",
        content:
          "Akibat insiden kristal jiwa yang pecah, kepala sekolah memutuskan menempatkan Leo di sebuah asrama tua terisolasi di ujung hutan terlarang, tempat yang dulunya digunakan oleh para penyihir hitam legendaris ratusan tahun lalu. Di sana, ia bertemu dengan seorang profesor senior eksentrik yang menawarkan diri untuk mengajarinya mengendalikan mana kegelapan secara rahasia.",
        createdAt: "2026-04-20",
        releasedAt: "2026-04-20T07:00:00Z",
        isFree: false,
      },
    ],
  },
  {
    id: "5",
    title: "Love in VR: Level Up",
    description:
      "Dua rival sengit di turnamen game Virtual Reality terbesar di dunia dipaksa bekerja sama dalam satu tim demi menyelesaikan quest legendaris berhadiah miliaran rupiah, tanpa mengetahui identitas asli satu sama lain di dunia nyata.",
    genre: ["Romance", "Comedy", "Sci-Fi"],
    banner: "https://picsum.photos/200/300",
    cover: "https://picsum.photos/200/300",
    isHot: false,
    status: "Ongoing",
    rating: 0,
    author: "Clarissa Utama",
    authorId: "author_5",
    isFree: false,
    viewsCount: 112000,
    favoritesCount: 7600,
    createdAt: "2026-03-20T11:00:00Z",
    updatedAt: "2026-07-02T10:15:00Z",
    chaptersList: [
      {
        id: "ch5_1",
        bookId: "5",
        chapterNumber: 1,
        title: "The Nemesis Log In",
        content:
          "Layar antarmuka virtual menyala hijau terang di dalam helm proyeksi neural milik Maya. Karakter gamenya, 'Valkyrie', melompat turun ke arena pertempuran pasir di kota digital Aethelgard. Di seberang arena, rival abadinya, ksatria hitam bernama 'ShadowBlade', sudah menunggunya dengan pedang besar terhunus. Mereka telah bertarung puluhan kali untuk memperebutkan peringkat nomor satu di server global.",
        createdAt: "2026-03-20",
        releasedAt: "2026-03-20T11:00:00Z",
        isFree: false,
      },
      {
        id: "ch5_2",
        bookId: "5",
        chapterNumber: 2,
        title: "The Forced Alliance",
        content:
          "Sebelum pertarungan mereka dimulai, sebuah pengumuman sistem darurat bergaung di seluruh penjuru game. Event Quest Terlarang berskala global diluncurkan secara otomatis oleh AI pusat game. Karena sistem mendeteksi peringkat tertinggi mereka, game memaksa Valkyrie dan ShadowBlade masuk dalam satu tim terkunci yang tidak bisa dibatalkan sampai quest terselesaikan.",
        createdAt: "2026-03-25",
        releasedAt: "2026-03-25T11:00:00Z",
        isFree: false,
      },
      {
        id: "ch5_3",
        bookId: "5",
        chapterNumber: 3,
        title: "Dungeon of Broken Code",
        content:
          "Quest pertama mengharuskan mereka memasuki labirin bawah tanah berisiko tinggi yang penuh dengan monster-monster siber berwujud laba-laba raksasa berglitch. Maya terpaksa mengandalkan perlindungan perisai ShadowBlade, sementara ia memberikan dukungan serangan panah sihir dari belakang. Di balik sifatnya yang menyebalkan di chat, gaya bertarung ShadowBlade ternyata sangat protektif.",
        createdAt: "2026-03-30",
        releasedAt: "2026-03-30T11:00:00Z",
        isFree: false,
      },
      {
        id: "ch5_4",
        bookId: "5",
        chapterNumber: 4,
        title: "The Coffee Shop Encounter",
        content:
          "Keesokan harinya di dunia nyata, Maya berjalan malas menuju kedai kopi kampus untuk mengerjakan skripsi tugas akhirnya. Karena meja penuh, seorang mahasiswa berkacamata meminta izin untuk duduk di seberangnya. Mahasiswa itu bernama Tio, kapten tim e-sports kampus yang dingin dan menyebalkan. Mereka berdebat tentang metode pemrograman, tanpa tahu bahwa mereka baru saja bertarung bersama di game tadi malam.",
        createdAt: "2026-04-04",
        releasedAt: "2026-04-04T11:00:00Z",
        isFree: false,
      },
      {
        id: "ch5_5",
        bookId: "5",
        chapterNumber: 5,
        title: "The First Dynamic Combo",
        content:
          "Kembali ke dalam game, tantangan bos gerbang labirin menanti mereka. Bos berwujud raksasa batu besi itu memiliki pertahanan tebal yang tidak bisa ditembus serangan biasa. Menggabungkan kecepatan Valkyrie dan kekuatan fisik ShadowBlade, mereka menciptakan teknik kombinasi baru yang berhasil menghancurkan titik lemah bos dalam satu serangan sinkron yang memukau.",
        createdAt: "2026-04-09",
        releasedAt: "2026-04-09T11:00:00Z",
        isFree: false,
      },
    ],
  },
  {
    id: "6",
    title: "The Chef's Secret Recipe",
    description:
      "Seorang koki berbakat menemukan buku resep misterius milik mendiang kakeknya yang ternyata memiliki kemampuan sihir untuk memengaruhi emosi dan ingatan setiap orang yang memakan masakannya.",
    genre: ["Drama", "Comedy", "Fantasy"],
    banner: "https://picsum.photos/206/306",
    cover: "https://picsum.photos/206/306",
    isHot: false,
    status: "Completed",
    rating: 0,
    author: "Andi Wijaya",
    authorId: "author_6",
    isFree: false,
    viewsCount: 65000,
    favoritesCount: 2800,
    createdAt: "2025-08-10T12:00:00Z",
    updatedAt: "2026-01-20T17:00:00Z",
    chaptersList: [
      {
        id: "ch6_1",
        bookId: "6",
        chapterNumber: 1,
        title: "The Forgotten Kitchen",
        content:
          "Asap tipis mengepul di dapur restoran tua keluarga yang hampir bangkrut. Genta menghela napas menatap barisan kursi pelanggan yang kosong melompong. Saat membersihkan ruang bawah tanah yang dipenuhi perkakas memasak peninggalan kakeknya, ia menemukan sebuah buku bersampul kulit rusa dengan tulisan tinta emas berjudul 'Rasa yang Menghidupkan Jiwa'.",
        createdAt: "2025-08-10",
        releasedAt: "2025-08-10T12:00:00Z",
        isFree: false,
      },
      {
        id: "ch6_2",
        bookId: "6",
        chapterNumber: 2,
        title: "Soup of Nostalgia",
        content:
          "Mencoba resep pertama, Genta memasak Sup Tomat Rempah Kuno dengan panduan takaran rahasia dari buku tersebut. Aroma masakan itu begitu harum hingga merayap keluar jendela. Seorang kritikus kuliner terkenal yang terkenal kejam dan dingin kebetulan lewat dan memutuskan masuk untuk memesan. Suapan pertama sup langsung membuat air mata sang kritikus menetes hangat.",
        createdAt: "2025-08-15",
        releasedAt: "2025-08-15T12:00:00Z",
        isFree: false,
      },
      {
        id: "ch6_3",
        bookId: "6",
        chapterNumber: 3,
        title: "The Food Critic's Tears",
        content:
          "Sup itu mengaktifkan kembali ingatan masa kecil kritikus tentang masakan ibunya yang telah lama tiada, mengubah kepribadiannya yang pahit menjadi lembut seketika. Ulasan bintang lima yang ditulisnya keesokan hari di media massa membuat restoran Genta mendadak viral di media sosial, memicu antrean panjang pelanggan yang penasaran di depan pintu.",
        createdAt: "2025-08-20",
        releasedAt: "2025-08-20T12:00:00Z",
        isFree: false,
      },
      {
        id: "ch6_4",
        bookId: "6",
        chapterNumber: 4,
        title: "The Jealous Competitor",
        content:
          "Kesuksesan mendadak Genta menarik perhatian pemilik jaringan restoran bintang lima di seberang jalan. Merasa tersaingi, koki sombong dari restoran tersebut menantang Genta dalam duel memasak terbuka di festival kuliner kota. Genta membuka halaman kedua bukunya, mencari resep hidangan penutup yang mampu membawa kedamaian hati bagi para juri festival.",
        createdAt: "2025-08-25",
        releasedAt: "2025-08-25T12:00:00Z",
        isFree: false,
      },
      {
        id: "ch6_5",
        bookId: "6",
        chapterNumber: 5,
        title: "Sweet Harmony",
        content:
          "Genta menyajikan Puding Karamel Lavender Sihir pada babak penentuan. Begitu sendok pertama menyentuh lidah para juri dan rivalnya, ketegangan kompetisi mendadak mencair menjadi suasana keakraban yang hangat. Koki rivalnya bahkan menjabat tangan Genta dengan penuh rasa hormat, mengakui keunggulan rasa emosional dari hidangan buatan Genta.",
        createdAt: "2025-08-30",
        releasedAt: "2025-08-30T12:00:00Z",
        isFree: false,
      },
    ],
  },
  {
    id: "7",
    title: "Chronicles of Eldoria",
    description:
      "Kisah epik kepahlawanan tentang seorang kesatria buangan yang harus mengumpulkan lima pecahan pedang suci matahari untuk menyegel kembali raja iblis yang terbangun dari tidurnya.",
    genre: ["Fantasy", "Adventure", "Action"],
    banner: "https://picsum.photos/203/303",
    cover: "https://picsum.photos/203/303",
    isHot: true,
    status: "Ongoing",
    rating: 0,
    author: "R.M. Roffen",
    authorId: "author_7",
    isFree: false,
    viewsCount: 245000,
    favoritesCount: 19800,
    createdAt: "2026-01-05T06:00:00Z",
    updatedAt: "2026-07-01T21:40:00Z",
    chaptersList: [
      {
        id: "ch7_1",
        bookId: "7",
        chapterNumber: 1,
        title: "The Exiled Knight",
        content:
          "Kael melangkah gontai melewati gerbang perbatasan kerajaan dengan baju zirah besi yang tergores lambang pengkhianat. Ia dikambinghitamkan atas jatuhnya benteng pertahanan barat oleh para bangsawan korup. Di tangannya, hanya tersisa sebilah pedang patah peninggalan ayahnya. Namun, di dalam tidurnya malam itu, sesosok dewi cahaya hadir memberikan petunjuk tentang pedang matahari kuno.",
        createdAt: "2026-01-05",
        releasedAt: "2026-01-05T06:00:00Z",
        isFree: false,
      },
      {
        id: "ch7_2",
        bookId: "7",
        chapterNumber: 2,
        title: "The First Shard in Ice Cave",
        content:
          "Perjalanan pertama menuntun Kael mendaki gunung salju Frostpeak yang membeku ekstrem. Di dalam gua es terdalam yang dijaga oleh monster beruang kutub bermata tiga, ia melihat pecahan pertama pedang suci yang memancarkan energi hangat berwarna emas. Menggunakan sisa keahlian bertarungnya, Kael berhasil mengalahkan penjaga gua dan menyatukan pecahan es ke pedangnya.",
        createdAt: "2026-01-12",
        releasedAt: "2026-01-12T06:00:00Z",
        isFree: false,
      },
      {
        id: "ch7_3",
        bookId: "7",
        chapterNumber: 3,
        title: "Elven Village of Whispers",
        content:
          "Kael tiba di perkampungan tersembunyi ras Elf yang berada di atas pohon-pohon raksasa hutan purba. Ras Elf awalnya menolak kedatangan manusia, namun setelah melihat kilauan energi matahari dari pedang Kael, sang ratu Elf memberikan pecahan kedua yang selama ini mereka jaga sebagai jantung pelindung hutan dari kabut kegelapan.",
        createdAt: "2026-01-19",
        releasedAt: "2026-01-19T06:00:00Z",
        isFree: false,
      },
      {
        id: "ch7_4",
        bookId: "7",
        chapterNumber: 4,
        title: "The Desert of Bones",
        content:
          "Gurun pasir kering yang dipenuhi tulang belulang monster naga purba menjadi rintangan berikutnya bagi Kael. Di tengah badai pasir yang menyiksa mata, ia disergap oleh kawanan bandit gurun bercadar hitam. Kael dikalahkan dan ditangkap, dibawa ke dalam benteng bawah tanah tempat pecahan ketiga pedang suci ternyata dijadikan sebagai dekorasi singgasana kepala bandit.",
        createdAt: "2026-01-26",
        releasedAt: "2026-01-26T06:00:00Z",
        isFree: false,
      },
      {
        id: "ch7_5",
        bookId: "7",
        chapterNumber: 5,
        title: "The Great Escape",
        content:
          "Menggunakan kelincahan dan bantuan seorang gadis pencuri yang juga disekap di sel bawah tanah, Kael berhasil menjebol jeruji besi tahanan. Mereka melakukan sabotase pada ruang penyimpanan persediaan minyak benteng, menciptakan ledakan besar sebagai pengalih perhatian untuk merebut kembali pedangnya dan membawa lari pecahan ketiga ke gurun bebas.",
        createdAt: "2026-02-02",
        releasedAt: "2026-02-02T06:00:00Z",
        isFree: false,
      },
    ],
  },
  {
    id: "8",
    title: "Mystery at Whisper High",
    description:
      "Detektif SMA jenius menyelidiki hilangnya siswi teladan secara misterius di sekolahnya, membuka rahasia kelam tentang eksperimen ilegal yang melibatkan para guru senior.",
    genre: ["Mystery", "Drama"],
    banner: "https://picsum.photos/207/307",
    cover: "https://picsum.photos/207/307",
    isHot: false,
    status: "Completed",
    rating: 0,
    author: "Siska Amelia",
    authorId: "author_8",
    isFree: false,
    viewsCount: 78000,
    favoritesCount: 4200,
    createdAt: "2025-10-15T08:30:00Z",
    updatedAt: "2026-03-10T12:00:00Z",
    chaptersList: [
      {
        id: "ch8_1",
        bookId: "8",
        chapterNumber: 1,
        title: "The Empty Desk",
        content:
          "Loker sekolah nomor 143 masih terkunci rapat, namun pemiliknya, Alika, siswi terpintar di angkatannya, sudah tidak masuk kelas selama tiga hari tanpa alasan medis. Pihak sekolah tampak mencoba menutupi kasus ini dengan menyebutnya kabur dari rumah. Dimas, ketua klub jurnalis sekolah, merasa ada kejanggalan besar dan mulai mengumpulkan petunjuk.",
        createdAt: "2025-10-15",
        releasedAt: "2025-10-15T08:30:00Z",
        isFree: false,
      },
      {
        id: "ch8_2",
        bookId: "8",
        chapterNumber: 2,
        title: "The Encrypted USB Drive",
        content:
          "Dimas menyelinap ke dalam ruang OSIS saat jam istirahat siang sepi. Di bawah tumpukan berkas laporan keuangan, ia menemukan sebuah USB drive kecil berwarna merah hitam milik Alika. Ketika didekripsi menggunakan komputer klub jurnalis, berkas di dalamnya berisi jadwal pertemuan rahasia antara kepala sekolah dan laboratorium medis swasta.",
        createdAt: "2025-10-22",
        releasedAt: "2025-10-22T08:30:00Z",
        isFree: false,
      },
      {
        id: "ch8_3",
        bookId: "8",
        chapterNumber: 3,
        title: "Midnight Break-In",
        content:
          "Malam hari pukul dua belas pas, Dimas memanjat pagar belakang sekolah yang gelap gulita. Bermodalkan lampu senter kecil, ia menuju ruang laboratorium biologi baru di lantai tiga. Di sana, ia menemukan pintu rahasia di balik lemari penyimpanan anatomi manusia, menuntunnya turun ke ruang bawah tanah bawah tanah yang steril bergaya rumah sakit.",
        createdAt: "2025-10-29",
        releasedAt: "2025-10-29T08:30:00Z",
        isFree: false,
      },
      {
        id: "ch8_4",
        bookId: "8",
        chapterNumber: 4,
        title: "The Subject Files",
        content:
          "Di dalam laboratorium rahasia itu berjajar tabung-tabung kaca besar berisi cairan biru kimiawi. Dimas menemukan map dokumen tebal bersimbol 'Project Evolution'. Saat membuka halaman profil subjek tes, foto Alika terpampang di sana bersama status detak jantung yang menunjukkan tanda kritis, membuktikan dia masih disembunyikan di dalam kompleks sekolah.",
        createdAt: "2025-11-05",
        releasedAt: "2025-11-05T08:30:00Z",
        isFree: false,
      },
      {
        id: "ch8_5",
        bookId: "8",
        chapterNumber: 5,
        title: "Caught in the Act",
        content:
          "Suara langkah kaki berat bersepatu pantofel mendadak terdengar dari arah tangga masuk laboratorium rahasia. Dimas panik bersembunyi di balik tabung reaksi raksasa. Lampu ruangan menyala terang, menampilkan sosok guru bimbingan konseling kesayangannya yang masuk bersama dua pria berbadan besar berpakaian hazmat, memegang suntikan serum ungu.",
        createdAt: "2025-11-12",
        releasedAt: "2025-11-12T08:30:00Z",
        isFree: false,
      },
    ],
  },
  {
    id: "9",
    title: "The Invisible Life of Addie",
    description:
      "Sebuah perjanjian dengan iblis membuat seorang wanita muda hidup selamanya, tetapi dikutuk untuk dilupakan oleh semua orang yang ditemuinya. Semuanya berubah ketika 300 tahun kemudian, ia menemukan seorang pria yang mengingat namanya.",
    genre: ["Fantasy", "Drama", "Romance"],
    banner: "https://picsum.photos/208/308",
    cover: "https://picsum.photos/208/308",
    isHot: false,
    status: "Ongoing",
    rating: 0,
    author: "V.E. Schwab",
    authorId: "author_9",
    isFree: false,
    viewsCount: 142000,
    favoritesCount: 11000,
    createdAt: "2026-03-15T07:45:00Z",
    updatedAt: "2026-07-01T18:20:00Z",
    chaptersList: [
      {
        id: "ch9_1",
        bookId: "9",
        chapterNumber: 1,
        title: "A Deal in the Dark",
        content:
          "Prancis, tahun 1714. Melarikan diri dari pernikahan paksa yang diatur keluarganya, Addie berlari ke dalam hutan kegelapan malam dan berdoa kepada dewa mana pun yang mendengarkan pesan sedihnya. Sayangnya, dewa yang menjawab doanya adalah iblis bayangan berwajah tampan yang menawarkan keabadian mutlak, dengan bayaran jiwanya diambil saat dia bosan hidup.",
        createdAt: "2026-03-15",
        releasedAt: "2026-03-15T07:45:00Z",
        isFree: false,
      },
      {
        id: "ch9_2",
        bookId: "9",
        chapterNumber: 2,
        title: "The Curse of Oblivion",
        content:
          "Addie terbangun keesokan paginya dengan sukacita kebebasan, namun sukacita itu berubah menjadi mimpi buruk mengerikan ketika ia kembali ke rumah. Ibunya tidak mengenalinya, ayahnya mengusirnya sebagai orang asing, bahkan ruangan kamarnya telah dikosongkan. Begitu ia keluar dari pandangan seseorang, ingatan orang itu tentang dirinya langsung terhapus tanpa sisa.",
        createdAt: "2026-03-22",
        releasedAt: "2026-03-22T07:45:00Z",
        isFree: false,
      },
      {
        id: "ch9_3",
        bookId: "9",
        chapterNumber: 3,
        title: "Three Centuries of Loneliness",
        content:
          "Tiga ratus tahun berlalu seperti bayangan air mengalir bagi Addie. Ia menyaksikan revolusi Prancis, perang dunia, hingga era modern di New York tahun 2026. Ia hidup sebagai hantu sejarah, tidak bisa meninggalkan jejak tulisan, foto, maupun ingatan di hati manusia. Setiap pagi adalah awal baru yang melelahkan karena ia harus memperkenalkan dirinya kembali ke dunia.",
        createdAt: "2026-03-29",
        releasedAt: "2026-03-29T07:45:00Z",
        isFree: false,
      },
      {
        id: "ch9_4",
        bookId: "9",
        chapterNumber: 4,
        title: "The Bookstore Miracle",
        content:
          "Langkah nasib membawanya ke sebuah toko buku antik beraroma kertas tua di Manhattan. Ia berniat mencuri sebuah buku novel kecil untuk mengusir bosan hidupnya. Saat kembali ke toko itu keesokan harinya, pemuda penjaga toko yang ramah memandangnya dengan terkejut lalu tersenyum hangat, 'Kamu kembali... Aku ingat kamu, Addie.' Kalimat sederhana itu menghentikan detak jantung keabadiannya.",
        createdAt: "2026-04-05",
        releasedAt: "2026-04-05T07:45:00Z",
        isFree: false,
      },
      {
        id: "ch9_5",
        bookId: "9",
        chapterNumber: 5,
        title: "I Remember You",
        content:
          "Pemuda itu bernama Henry. Untuk pertama kalinya dalam tiga abad kutukan berjalan, ada manusia yang mampu mengingat nama, wajah, dan senyumannya setelah satu hari berlalu. Air mata Addie tumpah ruah di pelukan Henry di tengah lorong toko buku, menyadari bahwa kutukan iblis bayangan akhirnya menemukan celah retakan takdir yang tidak terduga.",
        createdAt: "2026-04-12",
        releasedAt: "2026-04-12T07:45:00Z",
        isFree: false,
      },
    ],
  },
  {
    id: "10",
    title: "The Ghostly Roommate",
    description:
      "Komedi horor tentang seorang mahasiswa miskin yang menyewa kamar kos murah yang ternyata dihuni oleh hantu gadis bangsawan zaman Belanda yang cerewet dan manja.",
    genre: ["Comedy", "Fantasy"],
    banner: "https://picsum.photos/209/309",
    cover: "https://picsum.photos/209/309",
    isHot: false,
    status: "Completed",
    rating: 0,
    author: "Rizky Pratama",
    authorId: "author_10",
    isFree: true,
    viewsCount: 52000,
    favoritesCount: 1900,
    createdAt: "2025-09-01T04:00:00Z",
    updatedAt: "2025-12-25T14:00:00Z",
    chaptersList: [
      {
        id: "ch10_1",
        bookId: "10",
        chapterNumber: 1,
        title: "Kos No. 13",
        content:
          "Raka meletakkan kardus pakaian terakhirnya di lantai kamar kos barunya berukuran tiga kali tiga meter yang beraroma kayu jati tua melati. Kamar ini disewakan sangat murah, hanya tiga ratus ribu per bulan, harga yang mencurigakan untuk wilayah Jakarta Pusat. Saat ia hendak merebahkan diri di kasur kasur kapuk usang, suhu ruangan mendadak turun drastis menembus tulang.",
        createdAt: "2025-09-01",
        releasedAt: "2025-09-01T04:00:00Z",
        isFree: false,
      },
      {
        id: "ch10_2",
        bookId: "10",
        chapterNumber: 2,
        title: "The Colonial Ghost",
        content:
          "Sesosok bayangan transparan putih melayang keluar dari dalam lemari pakaian tua jepara di sudut kamar. Bayangan itu mewujud menjadi seorang gadis Eropa berwajah cantik mengenakan gaun kembang Victoria era kolonial abad ke-19. Bukannya menakuti Raka dengan wajah seram berdarah, hantu gadis itu justru berkacak pinggang dan memarahi Raka karena berantakan meletakkan kardus.",
        createdAt: "2025-09-08",
        releasedAt: "2025-09-08T04:00:00Z",
        isFree: false,
      },
      {
        id: "ch10_3",
        bookId: "10",
        chapterNumber: 3,
        title: "Cerewet Noni Anneliese",
        content:
          "Hantu noni Belanda itu bernama Anneliese. Ia menolak pergi karena mengklaim lemari jati itu adalah mas kawin pernikahannya yang gagal ratusan tahun lalu. Kehidupan kos Raka pun berubah drastis menjadi penuh komedi omelan. Anneliese sering membangunkannya subuh-subuh dengan menyalakan alarm HP secara magis hanya untuk memprotes debu di bawah kolong meja belajarnya.",
        createdAt: "2025-09-15",
        releasedAt: "2025-09-15T04:00:00Z",
        isFree: false,
      },
      {
        id: "ch10_4",
        bookId: "10",
        chapterNumber: 4,
        title: "Ghostly Examination Helper",
        content:
          "Tiba minggu ujian semester kampus, Raka belajar mati-matian hingga begadang semalaman suntuk di depan laptopnya untuk materi sejarah kolonial Indonesia. Anneliese yang melayang bosan di atas langit-langit kamar kos akhirnya mengintip layar dan mulai menceritakan detail peristiwa sejarah perang pangeran Diponegoro secara akurat berdasarkan pengalamannya langsung hidup di era tersebut.",
        createdAt: "2025-09-22",
        releasedAt: "2025-09-22T04:00:00Z",
        isFree: false,
      },
      {
        id: "ch10_5",
        bookId: "10",
        chapterNumber: 5,
        title: "The Expulsion Attempt",
        content:
          "Pemilik kos yang merasa curiga mendengar suara percakapan dari dalam kamar Raka diam-diam memanggil dukun pengusir roh halus tanpa persetujuan Raka. Saat Raka pergi kuliah, dukun itu merangsek masuk membawa kemenyan dan air suci ke dalam kamar kos nomor 13. Raka yang mendapatkan firasat buruk bergegas lari pulang untuk menyelamatkan teman hantu sekamarnya yang manja tersebut.",
        createdAt: "2025-09-29",
        releasedAt: "2025-09-29T04:00:00Z",
        isFree: false,
      },
    ],
  },
];

export const DUMMY_BOOKS = applyLockedChapterReleaseDates(
  withChapterLockStatus(normalizeChapterFreeFlags(RAW_BOOKS)),
);
