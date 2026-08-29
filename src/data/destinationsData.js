// Comprehensive Global Atlas covering all major countries, states, islands, and cities
// Complete coverage for Malaysia (all states & top destinations) and worldwide countries.

export const countriesData = [
  // ==========================================
  // MALAYSIA 🇲🇾 (Exhaustive National Coverage)
  // ==========================================
  {
    country: 'Malaysia',
    code: 'MY',
    flag: '🇲🇾',
    region: 'Asia',
    currency: 'MYR',
    description: 'Truly Asia — iconic twin towers, world-benchmark hawker food, pristine diving coral reefs, and 130-million-year-old rainforests.',
    places: [
      {
        id: 'kuala-lumpur',
        city: 'Kuala Lumpur',
        state: 'Federal Territory',
        lat: 3.1390,
        lng: 101.6869,
        airportCode: 'KUL',
        tag: 'Capital & Skyline',
        category: 'Metropolis',
        heroImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'kl-petronas', name: 'Petronas Twin Towers & KLCC Park', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 92100, priceEstimate: 'RM 98 (Skybridge)', estimatedHours: '2 hours', address: 'KLCC, 50088 Kuala Lumpur', lat: 3.1579, lng: 101.7116, image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80', description: 'The world’s tallest twin towers at 452m with double-deck skybridge and lake fountain shows.' },
          { id: 'kl-trx', name: 'The Exchange TRX & TRX City Park', category: 'Modern Landmark & Park', rating: 4.8, reviewsCount: 28400, priceEstimate: 'Free entrance (Rooftop Park)', estimatedHours: '2.5 hours', address: 'Persiaran TRX, 55188 Kuala Lumpur', lat: 3.1428, lng: 101.7188, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', description: 'Kuala Lumpur premier lifestyle landmark with a 10-acre elevated rooftop public park, luxury shopping, and dining.' },
          { id: 'kl-batu-caves', name: 'Batu Caves & 272 Rainbow Steps', category: 'Cultural & Heritage', rating: 4.7, reviewsCount: 84300, priceEstimate: 'Free entrance', estimatedHours: '2.5 hours', address: 'Gombak, 68100 Batu Caves, Selangor', lat: 3.2379, lng: 101.6840, image: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?auto=format&fit=crop&w=800&q=80', description: '400-million-year-old limestone temple guarded by the 42.7m golden Lord Murugan statue.' },
          { id: 'kl-aquaria', name: 'Aquaria KLCC', category: 'Family & Marine Life', rating: 4.7, reviewsCount: 41200, priceEstimate: 'RM 52 - RM 75', estimatedHours: '2 hours', address: 'Kuala Lumpur Convention Centre, KLCC', lat: 3.1534, lng: 101.7123, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', description: 'State-of-the-art oceanarium with 90-meter underwater transparent tunnel.' },
          { id: 'kl-tower', name: 'KL Tower (Menara Kuala Lumpur) & Sky Deck', category: 'Panoramic Viewpoints', rating: 4.7, reviewsCount: 52400, priceEstimate: 'RM 40 - RM 80', estimatedHours: '2 hours', address: '2, Jalan Puncak, 50250 Kuala Lumpur', lat: 3.1528, lng: 101.7038, image: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=800&q=80', description: '421m telecommunications tower with 360-degree open-air Sky Deck and glass Sky Box.' },
          { id: 'kl-thean-hou', name: 'Thean Hou Temple', category: 'Cultural & Heritage', rating: 4.7, reviewsCount: 31200, priceEstimate: 'Free', estimatedHours: '1.5 hours', address: '65, Persiaran Endah, 50460 Kuala Lumpur', lat: 3.1219, lng: 101.6872, image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=80', description: 'Six-tiered Chinese temple dedicated to Goddess Mazu adorned with thousands of red lanterns.' },
          { id: 'kl-chinatown', name: 'Petaling Street Chinatown & Kwai Chai Hong', category: 'Heritage & Street Walk', rating: 4.7, reviewsCount: 65200, priceEstimate: 'Free', estimatedHours: '2 hours', address: 'Jalan Petaling, City Centre, Kuala Lumpur', lat: 3.1438, lng: 101.6983, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', description: 'Historic Chinatown street market and restored heritage alleyways with interactive murals.' }
        ],
        restaurants: [
          { id: 'kl-village-park', name: 'Village Park Restaurant (Damansara Utama)', cuisine: 'Nasi Lemak Ayam Goreng', priceTier: '$', priceRange: 'RM 12 - RM 22', rating: 4.8, reviewsCount: 16500, mealType: 'Breakfast / Lunch', address: '5, Jalan SS 21/37, Damansara Utama', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', description: 'Malaysia benchmark Nasi Lemak with crispy spiced fried chicken.' },
          { id: 'kl-wong-ah-wah', name: 'Wong Ah Wah (Jalan Alor)', cuisine: 'Charcoal BBQ Chicken Wings', priceTier: '$$', priceRange: 'RM 25 - RM 60', rating: 4.7, reviewsCount: 9400, mealType: 'Dinner', address: '1, Jalan Alor, Bukit Bintang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Legendary street grill famous for smokey glazed chicken wings and salted egg squid.' },
          { id: 'kl-pelita', name: 'Restoran Nasi Kandar Pelita (KLCC)', cuisine: 'Halal Nasi Kandar', priceTier: '$', priceRange: 'RM 15 - RM 30', rating: 4.7, reviewsCount: 22100, mealType: 'Lunch / Dinner', address: '149, Jalan Ampang, 50450 Kuala Lumpur', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Famous 24-hour nasi kandar chain renowned for kuah campur gravy and crispy fried chicken.' }
        ]
      },
      {
        id: 'penang',
        city: 'Penang (George Town)',
        state: 'Penang',
        lat: 5.4164,
        lng: 100.3327,
        airportCode: 'PEN',
        tag: 'UNESCO Heritage & Food Capital',
        category: 'Cultural & Food',
        heroImage: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'penang-kek-lok-si', name: 'Kek Lok Si Temple (Temple of Supreme Bliss)', category: 'Cultural & Heritage', rating: 4.8, reviewsCount: 48900, priceEstimate: 'Free (Lift RM 6)', estimatedHours: '2.5 hours', address: 'Ayer Itam, Penang', lat: 5.3996, lng: 100.2736, image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80', description: 'Largest Buddhist temple complex in Malaysia with 30.2m bronze Guanyin statue.' },
          { id: 'penang-street-art', name: 'George Town UNESCO Heritage Street Art', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 42100, priceEstimate: 'Free', estimatedHours: '3 hours', address: 'Armenian St, George Town', lat: 5.4148, lng: 100.3364, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', description: 'World-famous interactive murals by Ernest Zacharevic.' }
        ],
        restaurants: [
          { id: 'penang-siam-road', name: 'Siam Road Charcoal Char Kway Teow', cuisine: 'Michelin Char Kway Teow', priceTier: '$', priceRange: 'RM 8 - RM 15', rating: 4.8, reviewsCount: 8200, mealType: 'Lunch', address: '82, Jalan Siam, George Town', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Wok-hei infused charcoal fried flat noodles with duck egg and prawns.' }
        ]
      },
      {
        id: 'langkawi',
        city: 'Langkawi Island',
        state: 'Kedah',
        lat: 6.3500,
        lng: 99.8000,
        airportCode: 'LGK',
        tag: 'Duty-Free Islands & Geoforest',
        category: 'Beaches & Islands',
        heroImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'langkawi-skybridge', name: 'Langkawi SkyBridge & SkyCab Cable Car', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 46200, priceEstimate: 'RM 45 - RM 85', estimatedHours: '3 hours', address: 'Teluk Burau, Langkawi', lat: 6.3860, lng: 99.6620, image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', description: '125m curved pedestrian suspension bridge 660m above Andaman Sea.' }
        ],
        restaurants: [
          { id: 'langkawi-cliff', name: 'The Cliff Restaurant & Sunset Bar', cuisine: 'Seafood & Sunset Dining', priceTier: '$$$', priceRange: 'RM 80 - RM 180', rating: 4.7, reviewsCount: 3900, mealType: 'Dinner', address: 'Pantai Cenang, Langkawi', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80', description: 'Clifftop Andaman ocean views and grilled seafood.' }
        ]
      },
      {
        id: 'melaka',
        city: 'Melaka (Malacca)',
        state: 'Melaka',
        lat: 2.1896,
        lng: 102.2501,
        airportCode: 'MKZ',
        tag: 'UNESCO Colonial Heritage',
        category: 'Cultural & Food',
        heroImage: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'melaka-dutch', name: 'Dutch Square (Stadthuys & Red Church)', category: 'Cultural & Heritage', rating: 4.7, reviewsCount: 56100, priceEstimate: 'Free', estimatedHours: '2 hours', address: 'Bandar Hilir, Melaka', lat: 2.1942, lng: 102.2492, image: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=800&q=80', description: '17th-century terracotta-red Dutch colonial administrative center.' }
        ],
        restaurants: [
          { id: 'melaka-baba', name: 'Baba Charlie Nyonya Kuih', cuisine: 'Peranakan Nyonya Kuih', priceTier: '$', priceRange: 'RM 10 - RM 25', rating: 4.7, reviewsCount: 6800, mealType: 'Snack', address: 'Jalan Tengkera, Melaka', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', description: 'Traditional handmade Nyonya kuih and sweet treats.' }
        ]
      },
      {
        id: 'kota-kinabalu',
        city: 'Kota Kinabalu',
        state: 'Sabah (Borneo)',
        lat: 5.9804,
        lng: 116.0735,
        airportCode: 'BKI',
        tag: 'Mount Kinabalu & Tropical Seas',
        category: 'Nature & Mountains',
        heroImage: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'kk-mount', name: 'Kinabalu National Park (Mount Kinabalu)', category: 'Nature & Parks', rating: 4.9, reviewsCount: 38200, priceEstimate: 'RM 15 - RM 50', estimatedHours: 'Full Day', address: 'Ranau, Sabah', lat: 6.0747, lng: 116.5385, image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80', description: 'UNESCO World Heritage Site with the 4,095m peak of Mount Kinabalu.' }
        ],
        restaurants: [
          { id: 'kk-welcome', name: 'Welcome Seafood Restaurant', cuisine: 'Live Sabah Seafood', priceTier: '$$', priceRange: 'RM 45 - RM 90', rating: 4.7, reviewsCount: 11200, mealType: 'Dinner', address: 'Kompleks Asia City, KK', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Fresh live tiger prawns, crabs, and wet butter squid.' }
        ]
      },
      {
        id: 'semporna',
        city: 'Semporna & Sipadan Islands',
        state: 'Sabah (Borneo)',
        lat: 4.4816,
        lng: 118.6111,
        airportCode: 'TWU',
        tag: 'World-Class Diving & Floating Villas',
        category: 'Beaches & Islands',
        heroImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'sipadan-reef', name: 'Sipadan Island Marine Sanctuary & Bohey Dulang', category: 'Nature & Parks', rating: 4.9, reviewsCount: 19800, priceEstimate: 'Permit & Tour RM 250 - RM 600', estimatedHours: 'Full Day', address: 'Sipadan Island, Celebes Sea', lat: 4.1147, lng: 118.6288, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', description: 'Jacques Cousteau’s top diving wonder with 3,000 fish species, sea turtles, and volcanic lagoon views.' }
        ],
        restaurants: [
          { id: 'semporna-seafood', name: 'Fat Mom’s Seafood Restaurant Semporna', cuisine: 'Fresh Catch Ocean Grill', priceTier: '$$', priceRange: 'RM 40 - RM 80', rating: 4.7, reviewsCount: 3100, mealType: 'Dinner', address: 'Jalan Kastam, Semporna', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Fresh mantis shrimp, salt & pepper crab, and grouper.' }
        ]
      },
      {
        id: 'ipoh',
        city: 'Ipoh',
        state: 'Perak',
        lat: 4.5975,
        lng: 101.0901,
        airportCode: 'IPH',
        tag: 'Limestone Temples & White Coffee Capital',
        category: 'Cultural & Food',
        heroImage: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'ipoh-kek-lok-tong', name: 'Kek Lok Tong Cave Temple & Zen Gardens', category: 'Cultural & Heritage', rating: 4.8, reviewsCount: 34200, priceEstimate: 'Free admission', estimatedHours: '2 hours', address: 'Gunung Rapat, 31350 Ipoh, Perak', lat: 4.5593, lng: 101.1294, image: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?auto=format&fit=crop&w=800&q=80', description: 'Dramatic limestone cave opening into a lush lotus lake park with jogging trails and paddle boats.' },
          { id: 'ipoh-perak-cave', name: 'Perak Cave Temple (Perak Tong)', category: 'Cultural & Heritage', rating: 4.8, reviewsCount: 28900, priceEstimate: 'Free admission', estimatedHours: '2 hours', address: 'Jalan Kuala Kangsar, 31400 Ipoh, Perak', lat: 4.6469, lng: 101.0988, image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=80', description: 'Historic 1926 limestone cave temple featuring a 40-foot golden Buddha and 450 steps leading to panoramic hilltop views.' },
          { id: 'ipoh-concubine-lane', name: 'Concubine Lane & Market Lane (Heritage Walk)', category: 'Heritage & Street Walk', rating: 4.7, reviewsCount: 46200, priceEstimate: 'Free', estimatedHours: '2.5 hours', address: 'Panglima Lane, Old Town, 30000 Ipoh', lat: 4.5968, lng: 101.0779, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', description: 'Vibrant restored mining-era heritage alleyways filled with colorful umbrella canopies, artisanal cafes, and street murals.' },
          { id: 'ipoh-kellies-castle', name: 'Kellie\'s Castle (Batu Gajah)', category: 'Iconic Landmarks', rating: 4.6, reviewsCount: 22400, priceEstimate: 'RM 5 - RM 10', estimatedHours: '2 hours', address: 'Batu Gajah, 31000 Perak', lat: 4.4753, lng: 101.0877, image: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=800&q=80', description: 'Romantic and mysterious Scottish-Moorish castle mansion built in 1915 with hidden tunnels and rooftop tower battlements.' },
          { id: 'ipoh-lost-world', name: 'Lost World of Tambun & Hot Springs', category: 'Theme Parks & Nature', rating: 4.6, reviewsCount: 31500, priceEstimate: 'RM 85 - RM 120', estimatedHours: 'Full Day', address: '1, Persiaran Lagun Sunway 1, Sunway City Ipoh', lat: 4.6256, lng: 101.1548, image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80', description: 'Eco-adventure theme park enclosed by 400-million-year-old limestone hills, natural hot springs, and water rides.' },
          { id: 'ipoh-tasik-cermin', name: 'Tasik Cermin (Mirror Lake) & Quarry Tunnel', category: 'Nature & Parks', rating: 4.7, reviewsCount: 18600, priceEstimate: 'RM 4 - RM 8', estimatedHours: '1.5 hours', address: 'Gunung Rapat, 31350 Ipoh, Perak', lat: 4.5612, lng: 101.1198, image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', description: 'Hidden emerald lake enclosed by towering limestone karst hills, accessed via a mysterious mining tunnel.' }
        ],
        restaurants: [
          { id: 'ipoh-thean-chun', name: 'Restoran Thean Chun (House of Mirrors)', cuisine: 'Kai Si Hor Fun & Caramel Custard', priceTier: '$', priceRange: 'RM 8 - RM 18', rating: 4.8, reviewsCount: 12800, mealType: 'Breakfast / Lunch', address: '73, Jalan Bandar Timah, 30000 Ipoh', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', description: 'Legendary 1950s coffeeshop serving silky shredded chicken hor fun in aromatic prawn oil broth and signature egg custard.' },
          { id: 'ipoh-nam-heong', name: 'Nam Heong White Coffee (Old Town)', cuisine: 'Original Ipoh White Coffee & Egg Tarts', priceTier: '$', priceRange: 'RM 6 - RM 15', rating: 4.7, reviewsCount: 14200, mealType: 'Breakfast / Tea', address: '2, Jalan Bandar Timah, 30000 Ipoh', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', description: 'Birthplace of aromatic Ipoh White Coffee paired with warm, freshly baked flaky egg tarts and dim sum.' },
          { id: 'ipoh-lou-wong', name: 'Restoran Tauge Ayam Lou Wong', cuisine: 'Ipoh Bean Sprouts Chicken', priceTier: '$$', priceRange: 'RM 18 - RM 40', rating: 4.6, reviewsCount: 19400, mealType: 'Lunch / Dinner', address: '49, Jalan Yau Tet Shin, 30300 Ipoh', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', description: 'Renowned poached free-range chicken served with crunchy fat Buntong bean sprouts and fragrant oily rice.' },
          { id: 'ipoh-funny-mountain', name: 'Funny Mountain Soya Bean', cuisine: 'Silky Tau Fu Fah (Soy Pudding)', priceTier: '$', priceRange: 'RM 3 - RM 8', rating: 4.7, reviewsCount: 15300, mealType: 'Snack / Dessert', address: '50, Jalan Mustapha Al-Bakri, 30300 Ipoh', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Ultra-smooth warm soybean pudding (tau fu fah) with ginger sugar syrup, famous for drive-through street service.' },
          { id: 'ipoh-ming-court', name: 'Ming Court Hong Kong Dim Sum', cuisine: 'Handmade Dim Sum & Yam Puffs', priceTier: '$', priceRange: 'RM 12 - RM 30', rating: 4.7, reviewsCount: 11500, mealType: 'Breakfast', address: '36, Jalan Leong Fee, 30300 Ipoh', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', description: 'Top-rated morning dim sum teahouse serving freshly steamed har gow, siew mai, and crispy wu gok yam dumplings.' }
        ]
      },
      {
        id: 'cameron-highlands',
        city: 'Cameron Highlands',
        state: 'Pahang',
        lat: 4.4721,
        lng: 101.3806,
        airportCode: 'IPH',
        tag: 'Tea Plantations & Strawberry Farms',
        category: 'Nature & Mountains',
        heroImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'cameron-boh', name: 'BOH Sungei Palas Tea Garden & Mossy Forest', category: 'Nature & Parks', rating: 4.8, reviewsCount: 39800, priceEstimate: 'Free entry', estimatedHours: '3 hours', address: 'Brinchang, Pahang', lat: 4.5173, lng: 101.4005, image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80', description: 'Cantilevered glass tea cafe over rolling green tea hills.' }
        ],
        restaurants: [
          { id: 'cameron-smoke', name: 'The Smokehouse Hotel & Restaurant', cuisine: 'English Scones & High Tea', priceTier: '$$$', priceRange: 'RM 45 - RM 90', rating: 4.7, reviewsCount: 3400, mealType: 'Tea', address: 'Tanah Rata, Cameron Highlands', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', description: 'Warm scones with homemade strawberry jam.' }
        ]
      },
      {
        id: 'genting-highlands',
        city: 'Genting Highlands',
        state: 'Pahang',
        lat: 3.4237,
        lng: 101.7932,
        airportCode: 'KUL',
        tag: 'Theme Parks & SkyWorlds',
        category: 'Theme Parks',
        heroImage: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'genting-skyworlds', name: 'Genting SkyWorlds Outdoor Theme Park & SkyAvenue', category: 'Theme Parks', rating: 4.7, reviewsCount: 31200, priceEstimate: 'RM 128 - RM 178', estimatedHours: 'Full Day', address: 'Genting Highlands, Pahang', lat: 3.4240, lng: 101.7940, image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80', description: '9 uniquely themed worlds with Studio-level roller coasters and Chin Swee Caves Temple.' }
        ],
        restaurants: [
          { id: 'genting-burger-lobster', name: 'Burger & Lobster SkyAvenue', cuisine: 'Wild Canadian Lobster', priceTier: '$$$', priceRange: 'RM 95 - RM 210', rating: 4.6, reviewsCount: 4200, mealType: 'Dinner', address: 'SkyAvenue, Genting Highlands', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Steamed & grilled wild lobsters with famous garlic lemon butter sauce.' }
        ]
      },
      {
        id: 'kuching',
        city: 'Kuching',
        state: 'Sarawak (Borneo)',
        lat: 1.5535,
        lng: 110.3592,
        airportCode: 'KCH',
        tag: 'Orangutans, Heritage & Gastronomy',
        category: 'Cultural & Nature',
        heroImage: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'kuching-semenggoh', name: 'Semenggoh Wildlife Centre (Orangutan Sanctuary)', category: 'Nature & Parks', rating: 4.9, reviewsCount: 32800, priceEstimate: 'RM 5 - RM 10', estimatedHours: '3 hours', address: 'KM 20, Jalan Puncak Borneo, 93250 Siburan, Sarawak', lat: 1.4011, lng: 110.3255, image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80', description: 'World-renowned rainforest sanctuary where free-roaming rescued Bornean orangutans emerge for feeding in the wild canopy.' },
          { id: 'kuching-borneo-museum', name: 'Borneo Cultures Museum', category: 'Museums & Art', rating: 4.9, reviewsCount: 21500, priceEstimate: 'RM 10 - RM 20', estimatedHours: '3.5 hours', address: 'Jalan Tun Abang Haji Openg, 93000 Kuching, Sarawak', lat: 1.5562, lng: 110.3441, image: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=800&q=80', description: 'Second largest museum in Southeast Asia with state-of-the-art immersive galleries showcasing Borneo indigenous cultures.' },
          { id: 'kuching-waterfront', name: 'Kuching Waterfront & Darul Hana S-Bridge', category: 'Heritage & Skyline', rating: 4.8, reviewsCount: 45200, priceEstimate: 'Free', estimatedHours: '2 hours', address: 'Jalan Main Bazaar, 93000 Kuching, Sarawak', lat: 1.5586, lng: 110.3458, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', description: 'Scenic 900m riverside promenade with panoramic views of the Astana Palace, historic sampan riverboats, and evening musical fountains.' },
          { id: 'kuching-bako-park', name: 'Bako National Park & Sea Stacks', category: 'Nature & Parks', rating: 4.8, reviewsCount: 19400, priceEstimate: 'RM 20 (Boat RM 40)', estimatedHours: 'Full Day', address: 'Muara Tebas Peninsula, Bako, Sarawak', lat: 1.7061, lng: 110.4678, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', description: 'Sarawak\'s oldest national park featuring endemic proboscis monkeys, wild bearded pigs, carnivorous pitcher plants, and coastal cliffs.' },
          { id: 'kuching-cultural-village', name: 'Sarawak Cultural Village (Living Museum)', category: 'Cultural & Heritage', rating: 4.8, reviewsCount: 18200, priceEstimate: 'RM 60 - RM 95', estimatedHours: '4 hours', address: 'Pantai Damai, Santubong, 93752 Kuching', lat: 1.7505, lng: 110.3168, image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80', description: '17-acre living ethnic museum showcasing authentic Iban longhouses, Bidayuh roundhouses, blowpipe demonstrations, and award-winning dances.' }
        ],
        restaurants: [
          { id: 'kuching-choon-hui', name: 'Choon Hui Cafe (Anthony Bourdain Laksa)', cuisine: 'Authentic Sarawak Laksa & Popiah', priceTier: '$', priceRange: 'RM 9 - RM 18', rating: 4.8, reviewsCount: 12400, mealType: 'Breakfast / Lunch', address: '34, Jalan Ban Hock, 93100 Kuching, Sarawak', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', description: 'Anthony Bourdain\'s celebrated Sarawak Laksa featuring rich aromatic prawn-tamarind broth, shredded omelette, and fresh sambal belacan.' },
          { id: 'kuching-lepau', name: 'Lepau Restaurant (Dayak Indigenous Cuisine)', cuisine: 'Authentic Dayak Bamboo Chicken', priceTier: '$$', priceRange: 'RM 25 - RM 60', rating: 4.8, reviewsCount: 6200, mealType: 'Lunch / Dinner', address: '99, Jalan Ban Hock, 93100 Kuching, Sarawak', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Award-winning native Dayak cuisine renowned for Manok Pansoh (chicken slow-cooked inside bamboo stalks with tapioca leaves) and wild midin ferns.' },
          { id: 'kuching-top-spot', name: 'Top Spot Food Court (Rooftop Seafood)', cuisine: 'Live Seafood & Wild Midin Ferns', priceTier: '$$', priceRange: 'RM 35 - RM 80', rating: 4.7, reviewsCount: 18900, mealType: 'Dinner', address: 'Jalan Bukit Mata Kuching, 93100 Kuching', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80', description: 'Massive rooftop seafood bazaar famous for stir-fried crispy midin with garlic, salted egg squid, butter prawns, and fresh grouper.' },
          { id: 'kuching-lau-ya-keng', name: 'Lau Ya Keng Temple Food Court', cuisine: 'Sarawak Kolo Mee & Pork Satay', priceTier: '$', priceRange: 'RM 7 - RM 16', rating: 4.7, reviewsCount: 11800, mealType: 'Breakfast / Lunch', address: '19, Carpenter Street, 93000 Kuching', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Century-old heritage open-air food stall opposite the Chinese temple serving springy homemade Kolo Mee and charcoal-grilled satay.' }
        ]
      },
      {
        id: 'redang-perhentian',
        city: 'Redang & Perhentian Islands',
        state: 'Terengganu',
        lat: 5.7686,
        lng: 103.0076,
        airportCode: 'TGG',
        tag: 'Crystal Turquoise Waters & Sea Turtles',
        category: 'Beaches & Islands',
        heroImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'redang-marine', name: 'Redang Marine Park & Turtle Bay Sanctuary', category: 'Nature & Parks', rating: 4.9, reviewsCount: 21400, priceEstimate: 'Conservation fee RM 5 - RM 30', estimatedHours: 'Full Day', address: 'Pulau Redang, Terengganu', lat: 5.7686, lng: 103.0076, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', description: 'Pristine coral reefs with baby reef sharks and nesting green sea turtles.' }
        ],
        restaurants: [
          { id: 'redang-summer', name: 'Summer Point Seafood BBQ Redang', cuisine: 'Island Charcoal Grilled Seafood', priceTier: '$$', priceRange: 'RM 35 - RM 70', rating: 4.7, reviewsCount: 1800, mealType: 'Dinner', address: 'Pasir Panjang, Pulau Redang', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Beachfront grilled stingray, sotong bakar, and chilled coconuts.' }
        ]
      },
      {
        id: 'johor-bahru',
        city: 'Johor Bahru & Desaru Coast',
        state: 'Johor',
        lat: 1.4927,
        lng: 103.7414,
        airportCode: 'JHB',
        tag: 'Legoland & Luxury Coast',
        category: 'Theme Parks & Beaches',
        heroImage: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'jb-legoland', name: 'Legoland Malaysia Resort & Desaru Waterpark', category: 'Theme Parks', rating: 4.7, reviewsCount: 45600, priceEstimate: 'RM 149 - RM 199', estimatedHours: 'Full Day', address: 'Iskandar Puteri, Johor', lat: 1.4274, lng: 103.6299, image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80', description: 'First Legoland theme park in Asia with water rides and Miniland.' }
        ],
        restaurants: [
          { id: 'jb-todak', name: 'Restoran Todak (Orang Asli Seafood)', cuisine: 'Seaside Live Seafood', priceTier: '$$', priceRange: 'RM 40 - RM 80', rating: 4.7, reviewsCount: 7800, mealType: 'Dinner', address: 'Teluk Jawa, Masai, Johor Bahru', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Overwater wooden pier dining with black pepper crab and steamed fish.' }
        ]
      }
    ]
  },

  // ==========================================
  // JAPAN 🇯🇵 (Tokyo, Kyoto, Osaka, Sapporo, Okinawa, Nara, Fukuoka)
  // ==========================================
  {
    country: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    region: 'Asia',
    currency: 'JPY',
    description: 'Ancient shrines, cherry blossoms, snow-capped Mount Fuji, and world-class culinary mastery.',
    places: [
      {
        id: 'tokyo',
        city: 'Tokyo',
        state: 'Kanto',
        lat: 35.6762,
        lng: 139.6503,
        airportCode: 'NRT',
        tag: 'Ultramodern Capital',
        category: 'Metropolis',
        heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'tokyo-sensoji', name: 'Sensō-ji Temple & Asakusa', category: 'Cultural & Heritage', rating: 4.8, reviewsCount: 78450, priceEstimate: 'Free', estimatedHours: '2.5 hours', address: 'Asakusa, Tokyo', lat: 35.7148, lng: 139.7967, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80', description: 'Tokyo’s oldest Buddhist temple founded in 645 AD.' }
        ],
        restaurants: [
          { id: 'tokyo-sushi-dai', name: 'Sushi Dai (Toyosu Market)', cuisine: 'Market Omakase Sushi', priceTier: '$$$', priceRange: '¥5,000 (~RM 150)', rating: 4.8, reviewsCount: 3450, mealType: 'Lunch', address: 'Toyosu, Tokyo', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', description: 'Fresh market omakase sushi.' }
        ]
      },
      {
        id: 'kyoto',
        city: 'Kyoto',
        state: 'Kansai',
        lat: 35.0116,
        lng: 135.7681,
        airportCode: 'KIX',
        tag: 'Temples & Bamboo Forest',
        category: 'Cultural & Heritage',
        heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'kyoto-fushimi', name: 'Fushimi Inari-taisha (10,000 Torii Gates)', category: 'Cultural & Heritage', rating: 4.9, reviewsCount: 92400, priceEstimate: 'Free', estimatedHours: '3 hours', address: 'Fushimi, Kyoto', lat: 34.9671, lng: 135.7727, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', description: 'Vermilion torii gates winding up sacred Mount Inari.' }
        ],
        restaurants: [
          { id: 'kyoto-omurice', name: 'Kichi Kichi Omurice', cuisine: 'Fluffy Omurice', priceTier: '$$', priceRange: '¥2,800 (~RM 85)', rating: 4.8, reviewsCount: 5200, mealType: 'Dinner', address: 'Nakagyo Ward, Kyoto', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', description: 'Fluffy cut-open egg omurice with demi-glace.' }
        ]
      },
      {
        id: 'osaka',
        city: 'Osaka',
        state: 'Kansai',
        lat: 34.6937,
        lng: 135.5023,
        airportCode: 'KIX',
        tag: 'Dotonbori & Takoyaki',
        category: 'Cultural & Food',
        heroImage: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'osaka-dotonbori', name: 'Dotonbori Canal & Osaka Castle', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 88500, priceEstimate: 'Free', estimatedHours: '2.5 hours', address: 'Chuo Ward, Osaka', lat: 34.6687, lng: 135.5013, image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80', description: 'Canal-side neon nightlife and historic Osaka Castle.' }
        ],
        restaurants: [
          { id: 'osaka-kukuru', name: 'Takoya Dotonbori Kukuru', cuisine: 'Octopus Takoyaki', priceTier: '$', priceRange: '¥800 (~RM 25)', rating: 4.7, reviewsCount: 7800, mealType: 'Snack', address: 'Dotonbori, Osaka', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', description: 'Crispy exterior octopus balls with sweet savory sauce.' }
        ]
      },
      {
        id: 'sapporo',
        city: 'Sapporo (Hokkaido)',
        state: 'Hokkaido',
        lat: 43.0618,
        lng: 141.3545,
        airportCode: 'CTS',
        tag: 'Powder Snow & Miso Ramen',
        category: 'Nature & Mountains',
        heroImage: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'sapporo-odori', name: 'Odori Park & Mt. Moiwa Ropeway', category: 'Nature & Parks', rating: 4.8, reviewsCount: 38400, priceEstimate: 'Ropeway ¥2,100', estimatedHours: '3 hours', address: 'Chuo Ward, Sapporo', lat: 43.0600, lng: 141.3500, image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80', description: 'Panoramic snow mountain views and famous Sapporo TV Tower.' }
        ],
        restaurants: [
          { id: 'sapporo-ramen', name: 'Ganso Ramen Yokocho (Ramen Alley)', cuisine: 'Hokkaido Butter Corn Miso Ramen', priceTier: '$', priceRange: '¥1,100 (~RM 35)', rating: 4.8, reviewsCount: 6200, mealType: 'Lunch / Dinner', address: 'Susukino, Sapporo', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', description: 'Rich miso broth with Hokkaido sweet corn and melting butter.' }
        ]
      }
    ]
  },

  // ==========================================
  // THAILAND 🇹🇭 (Bangkok, Phuket, Chiang Mai, Krabi, Koh Samui)
  // ==========================================
  {
    country: 'Thailand',
    code: 'TH',
    flag: '🇹🇭',
    region: 'Asia',
    currency: 'THB',
    description: 'Golden spires, world-class street cuisine, lush northern mountains, and turquoise island beaches.',
    places: [
      {
        id: 'bangkok',
        city: 'Bangkok',
        state: 'Central Thailand',
        lat: 13.7563,
        lng: 100.5018,
        airportCode: 'BKK',
        tag: 'Temples & Night Markets',
        category: 'Metropolis',
        heroImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'bkk-grand-palace', name: 'The Grand Palace & Wat Phra Kaew', category: 'Cultural & Heritage', rating: 4.8, reviewsCount: 89400, priceEstimate: 'THB 500 (~RM 65)', estimatedHours: '3 hours', address: 'Phra Nakhon, Bangkok', lat: 13.7500, lng: 100.4913, image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80', description: 'Royal complex with gold-leaf chedis and Emerald Buddha.' }
        ],
        restaurants: [
          { id: 'bkk-jay-fai', name: 'Raan Jay Fai (1 Michelin Star)', cuisine: 'Crispy Crab Omelette', priceTier: '$$$', priceRange: 'THB 1,200 (~RM 156)', rating: 4.7, reviewsCount: 6800, mealType: 'Dinner', address: 'Maha Chai Rd, Bangkok', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Crispy colossal crab meat omelette cooked over charcoal.' }
        ]
      },
      {
        id: 'phuket',
        city: 'Phuket',
        state: 'Southern Thailand',
        lat: 7.8804,
        lng: 98.3923,
        airportCode: 'HKT',
        tag: 'Beaches & Old Town',
        category: 'Beaches & Islands',
        heroImage: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'phuket-big-buddha', name: 'The Big Buddha & Kata Viewpoint', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 52400, priceEstimate: 'Free', estimatedHours: '2 hours', address: 'Karon, Phuket', lat: 7.8277, lng: 98.3129, image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80', description: '45m white marble statue on Nakkerd Hill overlooking Chalong Bay.' }
        ],
        restaurants: [
          { id: 'phuket-raya', name: 'Raya Restaurant (Phuket Old Town)', cuisine: 'Southern Thai Crab Curry', priceTier: '$$', priceRange: 'THB 450 (~RM 58)', rating: 4.7, reviewsCount: 4600, mealType: 'Dinner', address: 'Dibuk Rd, Phuket Old Town', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Sino-Portuguese mansion serving yellow crab curry.' }
        ]
      },
      {
        id: 'chiang-mai',
        city: 'Chiang Mai',
        state: 'Northern Thailand',
        lat: 18.7883,
        lng: 98.9853,
        airportCode: 'CNX',
        tag: 'Elephant Sanctuaries & Lanna Temples',
        category: 'Cultural & Nature',
        heroImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'cnx-doi-suthep', name: 'Wat Phra That Doi Suthep', category: 'Cultural & Heritage', rating: 4.9, reviewsCount: 48900, priceEstimate: 'THB 30', estimatedHours: '3 hours', address: 'Doi Suthep, Chiang Mai', lat: 18.8049, lng: 98.9215, image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80', description: 'Sacred mountain golden pagoda with panoramic views of Chiang Mai valley.' }
        ],
        restaurants: [
          { id: 'cnx-khao-soi', name: 'Khao Soi Khun Yai', cuisine: 'Northern Thai Khao Soi Curry', priceTier: '$', priceRange: 'THB 60 (~RM 8)', rating: 4.8, reviewsCount: 4100, mealType: 'Lunch', address: 'Sri Poom Rd, Chiang Mai', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', description: 'Creamy coconut curry egg noodles with tender chicken and crispy noodle crown.' }
        ]
      }
    ]
  },

  // ==========================================
  // INDONESIA 🇮🇩 (Bali, Yogyakarta, Jakarta, Komodo, Lombok)
  // ==========================================
  {
    country: 'Indonesia',
    code: 'ID',
    flag: '🇮🇩',
    region: 'Asia',
    currency: 'IDR',
    description: 'Emerald volcanic archipelago with sacred Hindu sea temples, surf breaks, and Komodo dragons.',
    places: [
      {
        id: 'bali',
        city: 'Bali (Ubud & Seminyak)',
        state: 'Bali',
        lat: -8.4095,
        lng: 115.1889,
        airportCode: 'DPS',
        tag: 'Island of the Gods',
        category: 'Beaches & Islands',
        heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'bali-uluwatu', name: 'Uluwatu Clifftop Temple & Fire Dance', category: 'Cultural & Heritage', rating: 4.8, reviewsCount: 56200, priceEstimate: 'IDR 50,000 (~RM 15)', estimatedHours: '3 hours', address: 'Pecatu, Bali', lat: -8.8291, lng: 115.0849, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', description: 'Clifftop temple 70m above crashing Indian ocean waves.' }
        ],
        restaurants: [
          { id: 'bali-locavore', name: 'Locavore NXT Ubud', cuisine: 'Modern Indonesian', priceTier: '$$$$', priceRange: 'IDR 1,450,000 (~RM 435)', rating: 4.9, reviewsCount: 2150, mealType: 'Dinner', address: 'Ubud, Bali', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80', description: 'Hyper-local organic Indonesian gastronomy.' }
        ]
      },
      {
        id: 'komodo',
        city: 'Komodo Island & Labuan Bajo',
        state: 'East Nusa Tenggara',
        lat: -8.5833,
        lng: 119.4833,
        airportCode: 'LBJ',
        tag: 'Pink Beach & Giant Lizards',
        category: 'Nature & Islands',
        heroImage: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'komodo-park', name: 'Komodo National Park & Padar Island Summit', category: 'Nature & Parks', rating: 4.9, reviewsCount: 24600, priceEstimate: 'Park fee IDR 150,000', estimatedHours: 'Full Day', address: 'Padar Island, Flores', lat: -8.6500, lng: 119.5667, image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80', description: 'Tricolor beach viewpoint (pink, black, white sands) and wild Komodo dragons.' }
        ],
        restaurants: [
          { id: 'komodo-bajo', name: 'Bajo Taco & Fresh Catch Grill', cuisine: 'Ocean Seafood Tacos', priceTier: '$$', priceRange: 'IDR 75,000 (~RM 22)', rating: 4.8, reviewsCount: 1900, mealType: 'Dinner', address: 'Labuan Bajo Harbour', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Fresh mahi-mahi tacos with sunset harbor views.' }
        ]
      }
    ]
  },

  // ==========================================
  // SOUTH KOREA 🇰🇷 (Seoul, Busan, Jeju Island)
  // ==========================================
  {
    country: 'South Korea',
    code: 'KR',
    flag: '🇰🇷',
    region: 'Asia',
    currency: 'KRW',
    description: 'Joseon royal palaces, K-pop culture, futuristic smart cities, and volcanic island wonderlands.',
    places: [
      {
        id: 'seoul',
        city: 'Seoul',
        state: 'Capital Region',
        lat: 37.5665,
        lng: 126.9780,
        airportCode: 'ICN',
        tag: 'K-Culture & Palaces',
        category: 'Metropolis',
        heroImage: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'seoul-gyeongbokgung', name: 'Gyeongbokgung Palace & Bukchon', category: 'Cultural & Heritage', rating: 4.8, reviewsCount: 68400, priceEstimate: '₩3,000 (~RM 10)', estimatedHours: '3 hours', address: 'Jongno-gu, Seoul', lat: 37.5796, lng: 126.9770, image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=800&q=80', description: 'Main Joseon royal palace with changing of the guard.' }
        ],
        restaurants: [
          { id: 'seoul-tosokchon', name: 'Tosokchon Samgyetang', cuisine: 'Ginseng Chicken Soup', priceTier: '$$', priceRange: '₩19,000 (~RM 65)', rating: 4.8, reviewsCount: 9400, mealType: 'Lunch', address: 'Jongno-gu, Seoul', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Stuffed young chicken with ginseng and sticky rice.' }
        ]
      },
      {
        id: 'busan',
        city: 'Busan',
        state: 'Yeongnam',
        lat: 35.1796,
        lng: 129.0756,
        airportCode: 'PUS',
        tag: 'Haeundae Beach & Jagalchi Fish Market',
        category: 'Beaches & Food',
        heroImage: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'busan-gamcheon', name: 'Gamcheon Culture Village & Haeundae Blueline', category: 'Cultural & Heritage', rating: 4.8, reviewsCount: 51200, priceEstimate: 'Free (Sky Capsule ₩30,000)', estimatedHours: '3 hours', address: 'Saha-gu, Busan', lat: 35.0975, lng: 129.0106, image: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&w=800&q=80', description: 'Vibrant pastel cliffside village and coastal sky capsule train.' }
        ],
        restaurants: [
          { id: 'busan-jagalchi', name: 'Jagalchi Live Fish Market Stalls', cuisine: 'Sashimi & Grilled Eel', priceTier: '$$', priceRange: '₩25,000 (~RM 85)', rating: 4.7, reviewsCount: 8900, mealType: 'Dinner', address: 'Jung-gu, Busan', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', description: 'Pick fresh live seafood downstairs, prepared on the spot.' }
        ]
      }
    ]
  },

  // ==========================================
  // EUROPE (France, UK, Italy, Spain, Switzerland, Netherlands)
  // ==========================================
  {
    country: 'France',
    code: 'FR',
    flag: '🇫🇷',
    region: 'Europe',
    currency: 'EUR',
    description: 'Haute cuisine, iconic Eiffel Tower, Champagne vineyards, and Mediterranean glamour.',
    places: [
      {
        id: 'paris',
        city: 'Paris',
        state: 'Île-de-France',
        lat: 48.8566,
        lng: 2.3522,
        airportCode: 'CDG',
        tag: 'City of Light',
        category: 'Metropolis',
        heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'paris-eiffel', name: 'Eiffel Tower & Louvre Museum', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 142000, priceEstimate: '€18 - €29', estimatedHours: '3 hours', address: 'Paris', lat: 48.8584, lng: 2.2945, image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80', description: 'Gustave Eiffel’s wrought-iron monument.' }
        ],
        restaurants: [
          { id: 'paris-entrecote', name: 'Le Relais de l’Entrecôte', cuisine: 'Steak Frites', priceTier: '$$', priceRange: '€35 (~RM 180)', rating: 4.7, reviewsCount: 11200, mealType: 'Dinner', address: 'Saint-Germain, Paris', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', description: 'Sirloin steak in herb butter sauce with golden frites.' }
        ]
      },
      {
        id: 'nice',
        city: 'Nice (French Riviera)',
        state: 'Provence-Alpes-Côte d’Azur',
        lat: 43.7102,
        lng: 7.2620,
        airportCode: 'NCE',
        tag: 'Promenade des Anglais & Azure Waters',
        category: 'Beaches & Coastal',
        heroImage: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'nice-promenade', name: 'Promenade des Anglais & Castle Hill', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 42100, priceEstimate: 'Free', estimatedHours: '2.5 hours', address: 'Prom. des Anglais, Nice', lat: 43.6950, lng: 7.2650, image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80', description: 'Palm-lined seaside boulevard overlooking the Baie des Anges.' }
        ],
        restaurants: [
          { id: 'nice-socca', name: 'Chez René Socca (Vieux Nice)', cuisine: 'Traditional Niçoise Socca', priceTier: '$', priceRange: '€6 (~RM 30)', rating: 4.7, reviewsCount: 3800, mealType: 'Snack', address: 'Rue Pairolière, Nice', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', description: 'Crispy chickpea pancake baked in wood-fired copper pans.' }
        ]
      }
    ]
  },
  {
    country: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    region: 'Europe',
    currency: 'GBP',
    description: 'Buckingham Palace, West End musicals, Scottish castles, and rolling Cotswold hills.',
    places: [
      {
        id: 'london',
        city: 'London',
        state: 'England',
        lat: 51.5074,
        lng: -0.1278,
        airportCode: 'LHR',
        tag: 'Historic Capital',
        category: 'Metropolis',
        heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'london-big-ben', name: 'Big Ben & Tower Bridge', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 104000, priceEstimate: 'Free', estimatedHours: '2.5 hours', address: 'Westminster, London', lat: 51.5007, lng: -0.1246, image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80', description: 'Elizabeth Tower and Victorian Gothic suspension bridge.' }
        ],
        restaurants: [
          { id: 'london-dishoom', name: 'Dishoom Covent Garden', cuisine: 'Bombay Comfort Food', priceTier: '$$', priceRange: '£25 (~RM 150)', rating: 4.8, reviewsCount: 15800, mealType: 'Dinner', address: 'Covent Garden, London', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', description: '24-hour slow-cooked black daal and garlic naan.' }
        ]
      },
      {
        id: 'edinburgh',
        city: 'Edinburgh',
        state: 'Scotland',
        lat: 55.9533,
        lng: -3.1883,
        airportCode: 'EDI',
        tag: 'Medieval Castle & Royal Mile',
        category: 'Cultural & Heritage',
        heroImage: 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'edi-castle', name: 'Edinburgh Castle & Arthur’s Seat', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 68400, priceEstimate: '£19.50', estimatedHours: '3 hours', address: 'Castlehill, Edinburgh', lat: 55.9486, lng: -3.1999, image: 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=800&q=80', description: 'Historic fortress perched atop an extinct volcanic crag.' }
        ],
        restaurants: [
          { id: 'edi-dish', name: 'The Witchery by the Castle', cuisine: 'Scottish Heritage Fine Dining', priceTier: '$$$$', priceRange: '£65 (~RM 390)', rating: 4.7, reviewsCount: 3900, mealType: 'Dinner', address: 'Royal Mile, Edinburgh', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80', description: 'Candlelit gothic dining serving Angus beef and Balmoral venison.' }
        ]
      }
    ]
  },
  {
    country: 'Italy',
    code: 'IT',
    flag: '🇮🇹',
    region: 'Europe',
    currency: 'EUR',
    description: 'Renaissance masterpieces, Roman ruins, Venetian gondolas, and Michelin gastronomy.',
    places: [
      {
        id: 'rome',
        city: 'Rome',
        state: 'Lazio',
        lat: 41.9028,
        lng: 12.4964,
        airportCode: 'FCO',
        tag: 'Colosseum & Vatican',
        category: 'Cultural & Heritage',
        heroImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'rome-colosseum', name: 'Colosseum & Roman Forum', category: 'Cultural & Heritage', rating: 4.8, reviewsCount: 152000, priceEstimate: '€18 (~RM 92)', estimatedHours: '3 hours', address: 'Roma', lat: 41.8902, lng: 12.4922, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', description: '2,000-year-old Roman amphitheater.' }
        ],
        restaurants: [
          { id: 'rome-roscioli', name: 'Roscioli Salumeria', cuisine: 'Roman Carbonara', priceTier: '$$$', priceRange: '€35 (~RM 180)', rating: 4.8, reviewsCount: 6400, mealType: 'Dinner', address: 'Via dei Giubbonari, Roma', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', description: 'Benchmark guanciale and pecorino carbonara.' }
        ]
      },
      {
        id: 'venice',
        city: 'Venice',
        state: 'Veneto',
        lat: 45.4408,
        lng: 12.3155,
        airportCode: 'VCE',
        tag: 'Grand Canal & Gondolas',
        category: 'Cultural & Water',
        heroImage: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'venice-st-marks', name: 'St. Mark’s Basilica & Rialto Bridge', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 84200, priceEstimate: 'Free (Basilica €3)', estimatedHours: '3 hours', address: 'Piazza San Marco, Venezia', lat: 45.4342, lng: 12.3389, image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80', description: 'Byzantine gold mosaics and marble bridges over turquoise canals.' }
        ],
        restaurants: [
          { id: 'venice-cicchetti', name: 'Cantina Do Mori (Since 1462)', cuisine: 'Venetian Cicchetti & Prosecco', priceTier: '$', priceRange: '€15 (~RM 75)', rating: 4.7, reviewsCount: 3200, mealType: 'Snack', address: 'San Polo, Venezia', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', description: 'Venice’s oldest bacaro serving artisan small bites under copper pots.' }
        ]
      }
    ]
  },

  // ==========================================
  // AMERICAS & OCEANIA & MIDDLE EAST
  // ==========================================
  {
    country: 'United States',
    code: 'US',
    flag: '🇺🇸',
    region: 'Americas',
    currency: 'USD',
    description: 'Vast national parks, iconic skyscrapers, diverse culinary hubs, and entertainment capitals.',
    places: [
      {
        id: 'new-york',
        city: 'New York City',
        state: 'New York',
        lat: 40.7128,
        lng: -74.0060,
        airportCode: 'JFK',
        tag: 'The Big Apple',
        category: 'Metropolis',
        heroImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'nyc-central-park', name: 'Central Park & SUMMIT One', category: 'Nature & Parks', rating: 4.8, reviewsCount: 148000, priceEstimate: 'Free', estimatedHours: '3.5 hours', address: 'Central Park, NY', lat: 40.7850, lng: -73.9682, image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80', description: '843-acre urban oasis in the center of Manhattan.' }
        ],
        restaurants: [
          { id: 'nyc-katzs', name: 'Katz’s Delicatessen', cuisine: 'Pastrami on Rye', priceTier: '$$', priceRange: '$28 (~RM 125)', rating: 4.7, reviewsCount: 27500, mealType: 'Lunch', address: 'Houston St, NY', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', description: 'Hand-carved hot pastrami on rye since 1888.' }
        ]
      },
      {
        id: 'san-francisco',
        city: 'San Francisco',
        state: 'California',
        lat: 37.7749,
        lng: -122.4194,
        airportCode: 'SFO',
        tag: 'Golden Gate & Cable Cars',
        category: 'Coastal',
        heroImage: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'sfo-golden-gate', name: 'Golden Gate Bridge & Alcatraz', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 112000, priceEstimate: 'Free', estimatedHours: '2.5 hours', address: 'San Francisco, CA', lat: 37.8199, lng: -122.4783, image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80', description: 'International orange suspension bridge across the bay.' }
        ],
        restaurants: [
          { id: 'sfo-boudin', name: 'Boudin Bakery Sourdough', cuisine: 'Clam Chowder Bowl', priceTier: '$$', priceRange: '$16 (~RM 72)', rating: 4.6, reviewsCount: 18400, mealType: 'Lunch', address: 'Fisherman’s Wharf, SF', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', description: 'Pacific clam chowder served in warm artisan sourdough.' }
        ]
      }
    ]
  },
  {
    country: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    region: 'Oceania',
    currency: 'AUD',
    description: 'Sydney Opera House, Great Barrier Reef, Bondi surf beaches, and Melbourne coffee culture.',
    places: [
      {
        id: 'sydney',
        city: 'Sydney',
        state: 'New South Wales',
        lat: -33.8688,
        lng: 151.2093,
        airportCode: 'SYD',
        tag: 'Opera House & Bondi',
        category: 'Coastal Metropolis',
        heroImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'syd-opera', name: 'Sydney Opera House & Harbour Bridge', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 118000, priceEstimate: 'AUD 43', estimatedHours: '2.5 hours', address: 'Bennelong Point, Sydney', lat: -33.8568, lng: 151.2153, image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', description: 'UNESCO expressionist sail architecture.' }
        ],
        restaurants: [
          { id: 'syd-bennelong', name: 'Bennelong Restaurant', cuisine: 'Modern Australian', priceTier: '$$$$', priceRange: 'AUD 185 (~RM 540)', rating: 4.8, reviewsCount: 2200, mealType: 'Dinner', address: 'Sydney Opera House', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80', description: 'Fine dining inside the Sydney Opera House sail.' }
        ]
      }
    ]
  },
  {
    country: 'United Arab Emirates',
    code: 'AE',
    flag: '🇦🇪',
    region: 'Middle East',
    currency: 'AED',
    description: 'Burj Khalifa, futuristic architecture, Palm Jumeirah islands, and golden desert dunes.',
    places: [
      {
        id: 'dubai',
        city: 'Dubai',
        state: 'Emirate of Dubai',
        lat: 25.2048,
        lng: 55.2708,
        airportCode: 'DXB',
        tag: 'Burj Khalifa & Luxury',
        category: 'Metropolis',
        heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80',
        attractions: [
          { id: 'dxb-burj', name: 'Burj Khalifa & Dubai Fountain', category: 'Iconic Landmarks', rating: 4.8, reviewsCount: 164000, priceEstimate: 'AED 179 (~RM 215)', estimatedHours: '2.5 hours', address: 'Downtown Dubai', lat: 25.1972, lng: 55.2744, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', description: 'World’s tallest skyscraper at 828 meters.' }
        ],
        restaurants: [
          { id: 'dxb-al-fanar', name: 'Al Fanar Restaurant', cuisine: 'Emirati Seafood Machboos', priceTier: '$$', priceRange: 'AED 95 (~RM 115)', rating: 4.7, reviewsCount: 6200, mealType: 'Dinner', address: 'Festival City, Dubai', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', description: 'Traditional spiced lamb and fish machboos.' }
        ]
      }
    ]
  }
]

// Flattened list of all places for direct access
export const popularDestinations = countriesData.flatMap(c =>
  c.places.map(p => ({
    ...p,
    country: c.country,
    countryCode: c.code,
    flag: c.flag,
    region: c.region,
    currency: c.currency
  }))
)
