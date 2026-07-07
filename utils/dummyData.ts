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

/** Locked chapters get release dates based on current time so they auto-unlock after WAIT_DAYS */
function applyLockedChapterReleaseDates(books: BookItem[]): BookItem[] {
  const now = new Date();

  return books.map((book) => ({
    ...book,
    chaptersList: book.chaptersList?.map((chapter) => {
      if (!chapter.isLocked) {
        return chapter;
      }

      // Set release dates to show different states:
      // Chapter 5+: released today (locked - needs coins)
      // Chapter 4: released 1 day ago (locked - needs coins)
      // Chapter 3: released 2 days ago (locked - needs coins, 1 day until free)
      // Chapter 2: released 4 days ago (wait_available - auto-unlocked after 3 days)
      // Chapter 1: released 6 days ago (wait_available - auto-unlocked after 3 days)
      const daysAgo = Math.max(0, (5 - chapter.chapterNumber) * 2);
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
      "A romantic comedy about an ordinary college student who suddenly finds himself as the heir to an ancient imperial throne hidden in the modern world. He must choose between his true love or the responsibility of the crown.",
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
          "The valley was deathly silent as night began to creep upward. Beneath the ruins of an ancient tower, a faint blue light began to flicker, piercing the darkness that had dominated the place for thousands of years. Ethan took a deep breath, feeling the cold night air penetrate his worn leather cloak. His hands trembled not from the cold, but because of the ancient artifact he had just discovered behind a hidden stone wall. 'So, the legend is real...' he whispered softly. His voice echoed faintly.",
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
          "The coronation day arrived sooner than expected. The entire palace hall was filled with nobles wearing luxurious silk robes, yet their gazes were full of skepticism and suspicion. Ethan stood before the sacred altar, staring at the gold crown studded with gleaming ruby stones under the candlelight. His heart pounded furiously. He knew that stepping forward meant leaving his old life as an ordinary person forever.",
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
          "The palace corridors felt far colder when night fell. Behind these thick stone walls, the empire's dark secrets were hidden from the outside world. Ethan walked without a sound, following the shadow of the suspicious old head servant. Their footsteps echoed faintly, leading him to a secret library where a dust-covered diary revealed a grand conspiracy about the previous king's sudden death.",
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
          "The clinking of crystal glasses and the sound of hollow laughter filled the main banquet hall. As the new heir, Ethan was forced to sit in the highest chair, becoming the center of attention for hundreds of power-hungry eyes. In the corner of the room, a pair of sharp eyes belonging to a princess from a neighboring kingdom kept watching him. Her thin smile hinted at a cunning plan ready to trap the new prince in a dangerous political game.",
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
          "Standing on the palace balcony overlooking the glittering city lights of the modern world below, Ethan pondered in silence. On one hand, he missed the small coffee shop where he worked and the ordinary girl who always greeted him with a smile. On the other hand, the fate of the empire now rested on his shoulders. As the night wind blew fiercely, he realized that this crown was a golden curse that imprisoned his freedom.",
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
      "Between life and death lies a library with endless shelves. Each book offers the chance to try another life you could have lived if you had made different decisions.",
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
          "Nora found herself standing before a large Gothic-style building shrouded in gray fog. Upon entering, she saw a great clock on the wall with its hands stopped precisely at midnight. The place felt peaceful yet foreign. An old woman dressed as a librarian greeted her with a warm smile, pointing to millions of dark green books lined neatly up to the ceiling.",
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
          "The librarian handed Nora a very heavy book. The book had no title, but contained a list of every regret she had ever felt throughout her life. Reading page after page made her chest feel tight, remembering every small decision she regretted. 'Every regret is a gateway to an alternative life you can try now,' the old woman whispered mysteriously.",
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
          "In the blink of an eye, the gray fog transformed into a vast white expanse of ice in Svalbard. Nora now woke up inside an Arctic research vessel, wearing thick storm-resistant clothing. In this life, she hadn't given up on her dream of becoming a glaciologist. She experienced true adventure, studying ancient glacier cracks, yet the profound loneliness in her heart remained unchanged.",
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
          "Nora opened her eyes beneath the blinding stage lights. The roar of tens of thousands of fans screaming her name echoed thunderously. She held an electric guitar, the vocalist of a world-famous band alongside her brother. But behind the grandeur of luxury hotels and sky-high popularity, she found her brother destroyed by industry pressure, making her question the true meaning of success.",
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
          "The next life brought her to a charming little house in the outskirts of London. She was married to a kind-hearted man and had an adorable little daughter. Everything seemed to be going perfectly, exactly like the ideal life she had always dreamed of. But Nora realized this happiness wasn't truly hers — it belonged to another version of Nora who had fought in this timeline.",
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
      "A half-human cyber detective hunts a legendary android assassin amid the neon glow of Tokyo in 2099, only to uncover a conspiracy threatening the extinction of the human race.",
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
          "Acid rain poured over the Shinjuku district, reflecting red and blue neon light in the dirty street puddles. Ren stood on a skyscraper rooftop, adjusting the cyber lens of his left eye to scan digital fingerprints at the crime scene. A technology corporation executive was found dead with his main memory chip forcibly extracted. The killer left behind an impeccably clean trail of binary code.",
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
          "The investigation led Ren into the deepest dark web network. Using a neural incubation device, he projected his consciousness into a virtual data labyrinth. There, he was attacked by a cyber virus in the form of a legendary black dragon. Just as he was about to be eliminated, a nameless artificial intelligence entity saved him and provided coordinates to a hidden weapons cache.",
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
          "The weapons cache turned out to be the secret headquarters of an android rebel group demanding equal civil rights. Led by an obsolete military-model android named Alpha, they denied the murder charge. Alpha showed encrypted video evidence that the actual killer was a secret cyber assassin prototype developed by the corporation itself.",
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
          "Armed with data from Alpha, Ren raided a secret research facility on the city's outskirts. A fierce battle erupted in the sterile laboratory corridors. Using his plasma katana sword, Ren cut through the automated guard robots. However, the primary target escaped using a stealth helicopter powered by a cyber jet engine, leaving behind a timed neural circuit-dissolving bomb.",
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
          "The bomb was defused at the last second, revealing a terrifying truth within the laboratory's server core. The corporation was preparing to release a global firmware update that would secretly lock the consciousness of all humans using cyber implants. Ren realized he had little time before the cyber signal satellite launch began.",
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
      "A talentless orphan accidentally activates the ancient seal of the Lord of Darkness, earning admission to the most prestigious magic academy with mysterious powers feared by everyone.",
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
          "In a world where every human is born with a mana circle on their chest, Leo was a pitiful anomaly. He possessed not a single trace of magical flow. Because of this, he was often ostracized and forced to work cleaning the old artifact storage in the village library. While cleaning a rusty iron chest, a drop of his wounded blood accidentally triggered an ancient dark magic circle.",
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
          "Dense black energy exploded from the chest, creeping into Leo's bloodstream and forming a dark purple double magic circle on his back. This power felt cold yet enormously massive. The next day, a messenger pigeon from the Asteria Magic Academy landed on his windowsill, carrying a golden invitation letter bearing the legendary dragon symbol.",
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
          "A steam train powered by magical crystal stones raced through the clouds toward the floating castle of Asteria. Inside the carriage, Leo sat among talented noble sorcerer children showing off their elemental abilities. Leo chose to hide his hands inside his robe, suppressing the surging dark energy that raged violently within his body whenever it neared another magical source.",
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
          "The academy's great hall was filled with thousands of floating candles. One by one, students stepped forward to place their hands on the Soul Crystal Ball to determine their elemental house. When Leo's turn came, he stepped forward hesitantly. The moment his palm touched the crystal surface, the ball didn't emit a pure natural element color — instead it cracked violently and emitted thick black smoke.",
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
          "Due to the shattered soul crystal incident, the headmaster decided to place Leo in an old, isolated dormitory at the edge of the forbidden forest, a place once used by legendary dark sorcerers hundreds of years ago. There, he met an eccentric senior professor who offered to secretly teach him how to control dark mana.",
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
      "Two fierce rivals in the world's largest Virtual Reality gaming tournament are forced to work together on the same team to complete a legendary quest worth billions, without knowing each other's real-world identities.",
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
          "The virtual interface screen lit up bright green inside Maya's neural projection helmet. Her game character, 'Valkyrie,' leaped down into the sand battle arena of the digital city Aethelgard. Across the arena, her eternal rival, a black knight named 'ShadowBlade,' was already waiting with his great sword drawn. They had fought dozens of times competing for the number one rank on the global server.",
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
          "Before their battle could begin, an emergency system announcement echoed across the entire game. A global-scale Forbidden Quest Event was automatically launched by the game's central AI. Because the system detected their top rankings, the game forced Valkyrie and ShadowBlade into a locked team that couldn't be disbanded until the quest was completed.",
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
          "The first quest required them to enter a high-risk underground labyrinth filled with glitching giant cyber spider monsters. Maya was forced to rely on ShadowBlade's shield protection while she provided magic arrow support from behind. Behind his annoying chat persona, ShadowBlade's fighting style turned out to be incredibly protective.",
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
          "The next day in the real world, Maya walked lazily to the campus coffee shop to work on her final thesis. Because the tables were full, a bespectacled male student asked permission to sit across from her. His name was Tio, the cold and annoying captain of the campus e-sports team. They argued about programming methods, unaware that they had just fought together in the game the night before.",
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
          "Back inside the game, a labyrinth gate boss challenge awaited them. The boss, a massive iron-stone giant, had thick defenses impervious to ordinary attacks. Combining Valkyrie's speed and ShadowBlade's physical strength, they created a new combination technique that successfully destroyed the boss's weak point in one spectacular synchronized strike.",
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
      "A talented chef discovers a mysterious recipe book belonging to his late grandfather that has magical abilities to influence the emotions and memories of anyone who eats his cooking.",
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
          "Thin smoke wafted in the kitchen of the old family restaurant that was nearly bankrupt. Genta sighed looking at the rows of empty customer chairs. While cleaning the basement filled with his grandfather's old cooking utensils, he found a book bound in deerskin with gold ink lettering titled 'Flavors That Bring Souls to Life.'",
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
          "Trying the first recipe, Genta cooked an Ancient Spiced Tomato Soup following the secret measurements from the book. The aroma of the dish was so fragrant it drifted out the window. A famously cruel and cold food critic happened to pass by and decided to come in and order. The first spoonful of soup immediately made the critic's warm tears flow.",
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
          "The soup reactivated the critic's childhood memories of his long-departed mother's cooking, instantly transforming his bitter personality into something gentle. The five-star review he wrote the next day in the media made Genta's restaurant suddenly go viral on social media, triggering a long queue of curious customers at the door.",
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
          "Genta's sudden success attracted the attention of the owner of a five-star restaurant chain across the street. Feeling challenged, the arrogant chef from that restaurant challenged Genta to an open cooking duel at the city's culinary festival. Genta opened the second page of his book, searching for a dessert recipe that could bring peace of heart to the festival judges.",
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
          "Genta presented the Magical Lavender Caramel Pudding in the deciding round. The moment the first spoon touched the lips of the judges and his rival, the competitive tension suddenly melted into a warm atmosphere of camaraderie. His rival chef even shook Genta's hand with deep respect, acknowledging the emotional superiority of Genta's dish.",
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
      "An epic tale of heroism about an exiled knight who must gather five fragments of the sacred sun sword to reseal the demon king who has awakened from his slumber.",
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
          "Kael staggered through the kingdom's border gates wearing iron armor scratched with the traitor's insignia. He had been scapegoated for the fall of the western fortress by corrupt nobles. In his hand, only a broken sword left by his father remained. But that night in his sleep, a goddess of light appeared, giving him clues about the ancient sun sword.",
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
          "The first journey led Kael to climb the extremely frozen Frostpeak snow mountain. Inside the deepest ice cave guarded by a three-eyed polar bear monster, he saw the first fragment of the sacred sword radiating warm golden energy. Using the last of his combat skills, Kael defeated the cave guardian and merged the ice fragment into his sword.",
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
          "Kael arrived at the hidden settlement of the Elf race, perched atop the giant trees of the primeval forest. The Elves initially refused the arrival of a human, but after seeing the glint of solar energy from Kael's sword, the Elf queen gave him the second fragment they had been guarding as the forest's protective heart against the fog of darkness.",
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
          "A dry desert filled with the bones of ancient dragon monsters became Kael's next obstacle. In the middle of a tormenting sandstorm, he was ambushed by a band of black-veiled desert bandits. Kael was defeated and captured, taken to an underground fortress where the third fragment of the sacred sword was used as decoration on the bandit chief's throne.",
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
          "Using his agility and the help of a thief girl who was also imprisoned in the underground cell, Kael managed to break through the iron prison bars. They sabotaged the fortress's oil storage room, creating a massive explosion as a diversion to reclaim his sword and carry off the third fragment into the free desert.",
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
      "A genius high school detective investigates the mysterious disappearance of a model student at his school, uncovering dark secrets about illegal experiments involving senior teachers.",
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
          "School locker number 143 remained tightly locked, but its owner, Alika, the smartest student in her class, had been absent for three days without medical reason. The school administration appeared to be covering up the case by saying she ran away from home. Dimas, the head of the school journalism club, sensed something deeply wrong and began collecting clues.",
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
          "Dimas snuck into the student council room during a quiet lunch break. Beneath a pile of financial reports, he found a small red-and-black USB drive belonging to Alika. When decrypted using the journalism club's computer, the files inside contained a schedule of secret meetings between the principal and a private medical laboratory.",
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
          "At exactly midnight, Dimas climbed the dark back fence of the school. Armed only with a small flashlight, he headed to the new biology laboratory on the third floor. There, he found a secret door behind the human anatomy storage cabinet, leading him down to an underground room that was sterile and styled like a hospital.",
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
          "Inside the secret laboratory, large glass tubes filled with blue chemical fluid stood in rows. Dimas found a thick document folder marked 'Project Evolution.' Upon opening the test subject profile page, Alika's photo was displayed alongside a heart rate status showing critical signs, proving she was still being hidden within the school complex.",
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
          "The heavy sound of dress shoe footsteps suddenly echoed from the laboratory's entrance stairway. Dimas panicked and hid behind a giant reaction tube. The room lights blazed on, revealing the figure of his beloved guidance counselor who entered alongside two large men in hazmat suits, holding syringes of purple serum.",
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
      "A pact with a devil grants a young woman eternal life, but curses her to be forgotten by everyone she meets. Everything changes when, 300 years later, she meets a man who remembers her name.",
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
          "France, 1714. Fleeing from an arranged marriage set by her family, Addie ran into the dark forest night and prayed to whichever god would hear her sorrowful plea. Unfortunately, the deity who answered was a shadow devil with a handsome face, offering absolute immortality in exchange for her soul when she grew tired of living.",
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
          "Addie awoke the next morning with the joy of freedom, but that joy turned into a horrifying nightmare when she returned home. Her mother didn't recognize her, her father drove her away as a stranger, and even her bedroom had been emptied. The moment she left someone's sight, their memory of her was instantly and completely erased.",
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
          "Three hundred years passed like flowing water shadows for Addie. She witnessed the French Revolution, the World Wars, and the modern era in New York, 2026. She lived as a ghost of history, unable to leave behind any writing, photograph, or memory in human hearts. Every morning was an exhausting new beginning because she had to reintroduce herself to the world.",
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
          "The steps of fate brought her to an antique bookstore smelling of old paper in Manhattan. She intended to steal a small novel to stave off the boredom of her existence. When she returned to the store the next day, the friendly young shopkeeper looked at her in surprise and then smiled warmly, 'You came back... I remember you, Addie.' That simple sentence stopped the heartbeat of her immortality.",
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
          "The young man's name was Henry. For the first time in three centuries of the walking curse, there was a human capable of remembering her name, her face, and her smile after a day had passed. Addie's tears poured out in Henry's embrace in the middle of the bookstore aisle, realizing that the shadow devil's curse had finally found an unexpected crack in fate.",
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
      "A horror comedy about a broke college student who rents a cheap boarding room that turns out to be haunted by the ghost of a fussy and spoiled Dutch noblewoman from the colonial era.",
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
          "Raka set down his last box of clothes on the floor of his new three-by-three meter boarding room that smelled of old teak wood and jasmine. The room was rented extremely cheaply, only three hundred thousand per month — a suspiciously low price for Central Jakarta. Just as he was about to lie down on the worn kapok mattress, the room temperature suddenly dropped drastically, chilling him to the bone.",
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
          "A transparent white shadow floated out from inside the old Jepara wardrobe in the corner of the room. The shadow materialized into a beautiful European girl wearing a Victorian-era colonial floral gown from the 19th century. Instead of terrifying Raka with a bloody scary face, the ghost girl planted her hands on her hips and scolded Raka for messily placing his boxes.",
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
          "The Dutch noblewoman ghost was named Anneliese. She refused to leave because she claimed the teak wardrobe was the bridal dowry from her failed wedding hundreds of years ago. Raka's boarding life was dramatically transformed into a comedy of constant nagging. Anneliese often woke him at dawn by magically turning on his phone alarm just to protest the dust under his desk.",
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
          "Campus exam week arrived, and Raka studied desperately, pulling an all-nighter in front of his laptop studying Indonesian colonial history. Anneliese, floating boredly above the room's ceiling, eventually peeked at his screen and began recounting the details of Prince Diponegoro's war with historical accuracy, drawing from her firsthand experience of actually living in that era.",
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
          "The boarding house owner, who had become suspicious of hearing conversation sounds from inside Raka's room, secretly called a spirit exorcist without Raka's consent. While Raka was at class, the exorcist barged in with incense and holy water into boarding room number 13. Raka, sensing a bad premonition, rushed home to save his spoiled ghost roommate.",
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
