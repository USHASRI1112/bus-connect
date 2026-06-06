async function syncTripLifecycle(pool) {
  await pool.query(`
    DELETE FROM trips
    WHERE created_at <= NOW() - INTERVAL '48 hours'
  `);

  await pool.query(`
    UPDATE trips
    SET archived_at = COALESCE(archived_at, NOW())
    WHERE archived_at IS NULL
      AND created_at <= NOW() - INTERVAL '24 hours'
  `);
}

function isArchivedRow(row) {
  return row.archived_at != null;
}

module.exports = {
  isArchivedRow,
  syncTripLifecycle,
};
