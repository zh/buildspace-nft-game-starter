const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory('NftGame');
  const gameContract = await gameContractFactory.deploy(
    ['Han Solo', 'Chewbacca', 'Luke SkyWalker'], // Names
    [
      'https://i.imgur.com/TqNFDMU.jpeg', // Images
      'https://i.imgur.com/b8Xw46P.jpeg',
      'https://i.imgur.com/bjNgTne.jpeg',
    ],
    [100, 200, 300], // HP values
    [100, 50, 25], // Attack damage values
    'Darth Vader', // Boss name
    'https://i.imgur.com/zsEQWXH.jpeg', // Boss image
    10000, // Boss hp
    50 // Boss attack damage
  );
  await gameContract.deployed();
  console.log('Contract deployed to:', gameContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
