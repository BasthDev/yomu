import { buildBookCommentCounts } from "../../utils/bookFilters";
import { BookItem } from "../../utils/books";
import * as Database from "../../utils/database";
import { DUMMY_BOOKS } from "../../utils/dummyData";

export interface BookRepository {
  getAllBooks(): Promise<BookItem[]>;
  getBookById(id: string): Promise<BookItem | null>;
  getCommentCountsByBook(): Promise<Record<string, number>>;
}

class LocalBookRepository implements BookRepository {
  async getAllBooks(): Promise<BookItem[]> {
    return DUMMY_BOOKS;
  }

  async getBookById(id: string): Promise<BookItem | null> {
    return DUMMY_BOOKS.find((b) => b.id === id) ?? null;
  }

  async getCommentCountsByBook(): Promise<Record<string, number>> {
    const chapterCounts = await Database.getCommentCountsByChapter();
    return buildBookCommentCounts(DUMMY_BOOKS, chapterCounts);
  }
}

export const bookRepository: BookRepository = new LocalBookRepository();
