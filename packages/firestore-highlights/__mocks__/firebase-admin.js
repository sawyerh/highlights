const admin = jest.genMockFromModule("firebase-admin");
let uniqueCount = 1;

/**
 * Firebase
 */

const mockHighlight = data => {
  const id = uniqueCount++;
  const docData = Object.assign(
    {
      body: "Hello world",
      location: "123"
    },
    data
  );

  return {
    data: () => docData,
    ref: {
      id: id,
      path: `${id}/test`
    }
  };
};

const mockVolume = data => {
  const id = uniqueCount++;
  const docData = Object.assign(
    {
      title: `Volume ${id}`,
      authors: ["Author Name"],
      foo: "bar"
    },
    data
  );

  return {
    data: () => docData,
    ref: {
      id: id,
      path: `${id}/test`
    }
  };
};

const volumes = {
  docs: [
    mockVolume({
      subtitle: "B",
      image: "/e.jpg"
    }),
    mockVolume()
  ]
};

const highlights = {
  docs: [
    mockHighlight({ volume: volumes.docs[0].data().ref }),
    mockHighlight({ volume: volumes.docs[0].data().ref })
  ]
};

const db = {
  highlights: highlights,
  volumes: volumes
};

admin.firestore = () => ({
  collection: name => {
    return {
      get: () => Promise.resolve(db[name])
    };
  }
});

module.exports = admin;
