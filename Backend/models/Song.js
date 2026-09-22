const { query } = require("../db");

class Song {
  static formatSong(row, includeBuffers = true) {
    if (!row) return null;
    const song = {
      id: row.id,
      _id: row.id.toString(),
      title: row.title,
      artist: row.artist,
      fileUrl: row.file_url,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    if (includeBuffers) {
      song.audioData = row.audio_data;
      song.audioContentType = row.audio_content_type;
      song.imageData = row.image_data;
      song.imageContentType = row.image_content_type;
    }

    return song;
  }

  static async create({
    title,
    artist,
    fileUrl,
    imageUrl,
    audioData,
    audioContentType,
    imageData,
    imageContentType
  }) {
    const res = await query(
      `INSERT INTO songs (
        title, artist, file_url, image_url, audio_data, audio_content_type, image_data, image_content_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        title,
        artist,
        fileUrl,
        imageUrl || null,
        audioData || null,
        audioContentType || null,
        imageData || null,
        imageContentType || null
      ]
    );
    return this.formatSong(res.rows[0]);
  }

  static async findWithoutBuffers() {
    const res = await query(
      `SELECT id, title, artist, file_url, image_url, created_at, updated_at
       FROM songs ORDER BY id DESC`
    );
    return res.rows.map(row => this.formatSong(row, false));
  }

  static async findOne(conditions) {
    if (conditions.fileUrl) {
      const res = await query(
        "SELECT * FROM songs WHERE file_url = $1 LIMIT 1",
        [conditions.fileUrl]
      );
      return this.formatSong(res.rows[0], true);
    }
    if (conditions.imageUrl) {
      const res = await query(
        "SELECT * FROM songs WHERE image_url = $1 LIMIT 1",
        [conditions.imageUrl]
      );
      return this.formatSong(res.rows[0], true);
    }
    return null;
  }
}

module.exports = Song;