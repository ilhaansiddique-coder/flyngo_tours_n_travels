module.exports = () => {
  const expected = {
    SESSION_TEST_DATABASE_URL: 'flyngo_sessions_test',
    PRIVATE_MEDIA_TEST_DATABASE_URL: 'flyngo_private_media_test',
    ACCOUNT_DELETION_TEST_DATABASE_URL: 'flyngo_account_deletion_test',
  };
  for (const [key, database] of Object.entries(expected)) {
    if (!process.env[key]) throw new Error(`${key} is required; integration tests must not silently skip`);
    const url = new URL(process.env[key]);
    if (url.hostname !== '127.0.0.1' || url.pathname !== `/${database}`) {
      throw new Error(`${key} must select the disposable localhost ${database} database`);
    }
  }
};
