import { PrismaClient } from '@prisma/client';

export async function seedLocations(prisma: PrismaClient) {
  console.log('  └─ Seeding/Updating Amenities...');

  // 1. Seed Tiện ích (Amenities)
  const defaultAmenities = [
    { name: 'Wifi tốc độ cao', icon: '📶' },
    { name: 'Bãi đỗ xe ô tô', icon: '🚗' },
    { name: 'Căng tin giải khát', icon: '☕' },
    { name: 'Phòng tắm nóng lạnh', icon: '🚿' },
    { name: 'Hệ thống quạt làm mát', icon: '💨' },
    { name: 'Thuê vợt & dụng cụ', icon: '🏸' },
    { name: 'Khán đài có mái che', icon: '🎪' },
    { name: 'Hệ thống đèn LED đạt chuẩn', icon: '💡' },
  ];

  const amenityMap: Record<string, bigint> = {};

  for (const am of defaultAmenities) {
    let dbAm = await prisma.amenity.findFirst({
      where: { name: am.name }
    });
    if (!dbAm) {
      dbAm = await prisma.amenity.create({
        data: { name: am.name, icon: am.icon }
      });
    }
    amenityMap[am.name] = dbAm.id;
  }

  console.log('  └─ Seeding 10 Partners & 10 Locations...');
  const hash = '$2b$10$4d5RdFzf7LO6QFHZTy5S8.5.b1QpisbtCidfFEzDT9mdeTy2eC87y'; // 'admin123'

  // Dữ liệu mẫu 10 cơ sở thể thao
  const locationsData = [
    {
      partnerEmail: 'partner1@booking.com',
      partnerName: 'Phạm Minh Hùng',
      businessName: 'Hệ Thống Thể Thao ProSport Việt Nam',
      locName: 'Cụm Sân Cầu Lông ProSport Bình Thạnh',
      address: '12 Đường Chu Văn An',
      ward: 'Phường 26',
      district: 'Quận Bình Thạnh',
      city: 'Hồ Chí Minh',
      lat: 10.801893,
      lng: 106.702283,
      phone: '0901234501',
      imageUrl: '/badminton_court.png',
      description: 'Cụm sân cầu lông ProSport sở hữu 10 thảm PVC Alsaflor cao cấp chống trơn trượt tuyệt đối. Ánh sáng dịu mắt chống chói, khu vực khán đài rộng và canteen phục vụ tận tình.',
      amenities: ['Wifi tốc độ cao', 'Bãi đỗ xe ô tô', 'Căng tin giải khát', 'Hệ thống đèn LED đạt chuẩn'],
      courts: [
        { name: 'Sân Cầu Lông Số 1 (Vip)', category: 'Cầu Lông', subType: 'Sân thảm PVC', price: 90000 },
        { name: 'Sân Cầu Lông Số 2', category: 'Cầu Lông', subType: 'Sân thảm PVC', price: 80000 },
        { name: 'Sân Cầu Lông Số 3', category: 'Cầu Lông', subType: 'Sân thảm PVC', price: 80000 },
      ]
    },
    {
      partnerEmail: 'partner2@booking.com',
      partnerName: 'Trần Thanh Hải',
      businessName: 'Thành Phát Football Club',
      locName: 'Sân Bóng Đá Cỏ Nhân Tạo Thành Phát Quận 7',
      address: '1024 Đường Nguyễn Hữu Thọ',
      ward: 'Phường Tân Phong',
      district: 'Quận 7',
      city: 'Hồ Chí Minh',
      lat: 10.732643,
      lng: 106.701984,
      phone: '0901234502',
      imageUrl: '/soccer_field.png',
      description: 'Sân bóng mini cỏ nhân tạo Thành Phát được nâng cấp mặt cỏ định kỳ, cao su đàn hồi tốt chống chấn thương. Phù hợp cho các trận bóng 5 người và 7 người sôi động.',
      amenities: ['Bãi đỗ xe ô tô', 'Căng tin giải khát', 'Phòng tắm nóng lạnh', 'Khán đài có mái che'],
      courts: [
        { name: 'Sân Bóng 5 Người (Sân A)', category: 'Bóng Đá', subType: 'Sân cỏ 5 người', price: 150000 },
        { name: 'Sân Bóng 5 Người (Sân B)', category: 'Bóng Đá', subType: 'Sân cỏ 5 người', price: 150000 },
        { name: 'Sân Bóng 7 Người (Vip)', category: 'Bóng Đá', subType: 'Sân cỏ 7 người', price: 280000 },
      ]
    },
    {
      partnerEmail: 'partner3@booking.com',
      partnerName: 'Lê Văn Tám',
      businessName: 'CLB Tennis Grand Slam',
      locName: 'Câu Lạc Bộ Tennis Đất Nện Grand Slam Thủ Đức',
      address: '48 Đường Võ Văn Ngân',
      ward: 'Phường Bình Thọ',
      district: 'TP. Thủ Đức',
      city: 'Hồ Chí Minh',
      lat: 10.846522,
      lng: 106.772413,
      phone: '0901234503',
      imageUrl: '/tennis_court.png',
      description: 'Sân Tennis Grand Slam mang lại trải nghiệm chuẩn quốc tế với cả sân cứng và sân đất nện cao cấp. Có huấn luyện viên chuyên nghiệp hướng dẫn và hỗ trợ nhặt bóng.',
      amenities: ['Wifi tốc độ cao', 'Bãi đỗ xe ô tô', 'Phòng tắm nóng lạnh', 'Thuê vợt & dụng cụ'],
      courts: [
        { name: 'Sân Tennis Cứng Số 1', category: 'Tennis', subType: 'Sân cứng Acrylic', price: 200000 },
        { name: 'Sân Tennis Đất Nện Vip', category: 'Tennis', subType: 'Sân đất nện', price: 250000 },
      ]
    },
    {
      partnerEmail: 'partner4@booking.com',
      partnerName: 'Hoàng Kim Khánh',
      businessName: 'Trung Tâm Thể Thao Đa Năng StarGym',
      locName: 'Trung Tâm Cầu Lông Đa Năng StarSport Cầu Giấy',
      address: '15 Đường Duy Tân',
      ward: 'Phường Dịch Vọng Hậu',
      district: 'Quận Cầu Giấy',
      city: 'Hà Nội',
      lat: 21.028754,
      lng: 105.782354,
      phone: '0901234504',
      imageUrl: '/badminton_court.png',
      description: 'Sân cầu lông máy lạnh mát mẻ quanh năm tại trung tâm Hà Nội. Cam kết chất lượng ánh sáng, thảm lót êm ái chống rung cho đầu gối và gót chân.',
      amenities: ['Wifi tốc độ cao', 'Căng tin giải khát', 'Hệ thống quạt làm mát', 'Hệ thống đèn LED đạt chuẩn'],
      courts: [
        { name: 'Sân Cầu Lông Cao Cấp A1', category: 'Cầu Lông', subType: 'Sân thảm thi đấu', price: 100000 },
        { name: 'Sân Cầu Lông Cao Cấp A2', category: 'Cầu Lông', subType: 'Sân thảm thi đấu', price: 100000 },
      ]
    },
    {
      partnerEmail: 'partner5@booking.com',
      partnerName: 'Nguyễn Tiến Minh',
      businessName: 'Minh Sport Arena',
      locName: 'Nhà Thi Đấu Thể Thao Đa Năng Tiền Phong Hà Đông',
      address: '25 Đường Phùng Hưng',
      ward: 'Phường Phúc La',
      district: 'Quận Hà Đông',
      city: 'Hà Nội',
      lat: 20.972355,
      lng: 105.789235,
      phone: '0901234505',
      imageUrl: '/soccer_field.png',
      description: 'Sân bóng đá phủi nổi tiếng Hà Đông với dàn đèn LED sáng như ban ngày, khu vực nghỉ ngơi thoáng rộng và nước nôi dịch vụ giá cả cực kỳ học sinh sinh viên.',
      amenities: ['Bãi đỗ xe ô tô', 'Căng tin giải khát', 'Khán đài có mái che', 'Hệ thống đèn LED đạt chuẩn'],
      courts: [
        { name: 'Sân Bóng Đêm Đèn Led A', category: 'Bóng Đá', subType: 'Sân cỏ nhân tạo', price: 180000 },
        { name: 'Sân Bóng Đêm Đèn Led B', category: 'Bóng Đá', subType: 'Sân cỏ nhân tạo', price: 180000 },
      ]
    },
    {
      partnerEmail: 'partner6@booking.com',
      partnerName: 'Vũ Mạnh Cường',
      businessName: 'VMC Tennis & Badminton Club',
      locName: 'Tổ Hợp Thể Thao Đất Cảng Lạch Tray',
      address: '2 Đường Lạch Tray',
      ward: 'Phường Lạch Tray',
      district: 'Quận Ngô Quyền',
      city: 'Hải Phòng',
      lat: 20.852355,
      lng: 106.689235,
      phone: '0901234506',
      imageUrl: '/tennis_court.png',
      description: 'Khu vực tổ hợp thể thao đẳng cấp nhất Hải Phòng gồm cụm sân tennis, cầu lông ngoài trời và trong nhà. Không gian rộng rãi, thoáng mát, đỗ xe thuận tiện.',
      amenities: ['Wifi tốc độ cao', 'Bãi đỗ xe ô tô', 'Căng tin giải khát', 'Thuê vợt & dụng cụ'],
      courts: [
        { name: 'Sân Tennis VMC 1', category: 'Tennis', subType: 'Sân tiêu chuẩn', price: 220000 },
        { name: 'Sân Cầu Lông Trong Nhà VMC 2', category: 'Cầu Lông', subType: 'Sân thảm silicon', price: 90000 },
      ]
    },
    {
      partnerEmail: 'partner7@booking.com',
      partnerName: 'Phan Văn Trị',
      businessName: 'CLB Sân Sông Hàn',
      locName: 'Cụm Sân Cỏ Nhân Tạo Sông Hàn Đà Nẵng',
      address: '32 Đường Bạch Đằng',
      ward: 'Phường Thạch Thang',
      district: 'Quận Hải Châu',
      city: 'Đà Nẵng',
      lat: 16.079234,
      lng: 108.223522,
      phone: '0901234507',
      imageUrl: '/soccer_field.png',
      description: 'Sân nằm sát bờ sông Hàn lộng gió mát mẻ tự nhiên. Mặt cỏ xịn, hệ thống thoát nước hiện đại chơi được tốt ngay cả sau các cơn mưa lớn.',
      amenities: ['Bãi đỗ xe ô tô', 'Căng tin giải khát', 'Phòng tắm nóng lạnh', 'Khán đài có mái che'],
      courts: [
        { name: 'Sân Sông Hàn A', category: 'Bóng Đá', subType: 'Sân 5 người cỏ mềm', price: 140000 },
        { name: 'Sân Sông Hàn B', category: 'Bóng Đá', subType: 'Sân 5 người cỏ mềm', price: 140000 },
      ]
    },
    {
      partnerEmail: 'partner8@booking.com',
      partnerName: 'Dương Quốc Nam',
      businessName: 'Hoàng Gia Sport Center',
      locName: 'Hội Quán Cầu Lông Hoàng Gia Nha Trang',
      address: '88 Đường Trần Phú',
      ward: 'Phường Lộc Thọ',
      district: 'TP. Nha Trang',
      city: 'Khánh Hòa',
      lat: 12.239245,
      lng: 109.198345,
      phone: '0901234508',
      imageUrl: '/badminton_court.png',
      description: 'Cụm sân cầu lông sát biển Nha Trang vừa chơi cầu lông vừa hít gió biển trong lành. Thảm lót cao cấp, có phục vụ nước dừa tươi nguyên chất giải khát.',
      amenities: ['Wifi tốc độ cao', 'Căng tin giải khát', 'Hệ thống quạt làm mát', 'Hệ thống đèn LED đạt chuẩn'],
      courts: [
        { name: 'Sân Cầu Lông Hoàng Gia 1', category: 'Cầu Lông', subType: 'Sân thảm PVC', price: 85000 },
        { name: 'Sân Cầu Lông Hoàng Gia 2', category: 'Cầu Lông', subType: 'Sân thảm PVC', price: 85000 },
      ]
    },
    {
      partnerEmail: 'partner9@booking.com',
      partnerName: 'Bùi Xuân Huấn',
      businessName: 'Huấn Hoa Hồng Arena',
      locName: 'Trung Tâm Đào Tạo Tennis Trẻ Hồng Bàng',
      address: '77 Đường Hùng Vương',
      ward: 'Phường Thượng Lý',
      district: 'Quận Hồng Bàng',
      city: 'Hải Phòng',
      lat: 20.869234,
      lng: 106.663522,
      phone: '0901234509',
      imageUrl: '/tennis_court.png',
      description: 'Học viện đào tạo quần vợt với các lớp học cơ bản và nâng cao cho mọi lứa tuổi. Sân đấu mái che râm mát, thiết bị luyện tập công nghệ cao hỗ trợ tối đa.',
      amenities: ['Wifi tốc độ cao', 'Bãi đỗ xe ô tô', 'Thuê vợt & dụng cụ', 'Khán đài có mái che'],
      courts: [
        { name: 'Sân Đào Tạo Basic A', category: 'Tennis', subType: 'Sân Acrylic cao cấp', price: 210000 },
        { name: 'Sân Đào Tạo Basic B', category: 'Tennis', subType: 'Sân Acrylic cao cấp', price: 210000 },
      ]
    },
    {
      partnerEmail: 'partner10@booking.com',
      partnerName: 'Vương Đình Huệ',
      businessName: 'CLB Thể Thao Đô Thị Mới',
      locName: 'Sân Bóng Đá Mini Đô Thị Mới Cần Thơ',
      address: '150 Đường Nguyễn Văn Cừ',
      ward: 'Phường An Khánh',
      district: 'Quận Ninh Kiều',
      city: 'Cần Thơ',
      lat: 10.038475,
      lng: 105.748374,
      phone: '0901234510',
      imageUrl: '/soccer_field.png',
      description: 'Sân phủi chất lượng hàng đầu miền Tây sông nước. Mặt cỏ lót tấm đệm cao su giảm chấn lực, chỗ ngồi mát mẻ ngắm hoàng hôn sông nước sau giờ đá bóng căng thẳng.',
      amenities: ['Bãi đỗ xe ô tô', 'Căng tin giải khát', 'Hệ thống đèn LED đạt chuẩn', 'Phòng tắm nóng lạnh'],
      courts: [
        { name: 'Sân Bóng Ninh Kiều 1', category: 'Bóng Đá', subType: 'Sân cỏ 5 người', price: 130000 },
        { name: 'Sân Bóng Ninh Kiều 2', category: 'Bóng Đá', subType: 'Sân cỏ 5 người', price: 130000 },
      ]
    }
  ];

  // Lấy khách hàng Nguyễn Văn A có sẵn từ user.seeder
  const defaultCustomer = await prisma.user.findFirst({
    where: { email: 'customer@booking.com' }
  });

  for (const item of locationsData) {
    // 2. Tạo User cho đối tác nếu chưa có
    let partnerUser = await prisma.user.findUnique({
      where: { email: item.partnerEmail }
    });

    if (!partnerUser) {
      partnerUser = await prisma.user.create({
        data: {
          fullName: item.partnerName,
          email: item.partnerEmail,
          password: hash,
          phone: item.phone,
          address: `${item.address}, ${item.ward}, ${item.district}, ${item.city}`,
          isActive: true
        }
      });
    }

    // 3. Tạo PartnerProfile
    let profile = await prisma.partnerProfile.findFirst({
      where: { userId: partnerUser.id }
    });

    if (!profile) {
      profile = await prisma.partnerProfile.create({
        data: {
          userId: partnerUser.id,
          businessName: item.businessName,
          taxCode: '0102030405',
          businessLicenseUrl: 'https://example.com/license.pdf',
          commissionRate: 10.00,
          commissionType: 'PERCENTAGE',
          balance: 0.00,
          status: 'ACTIVE'
        }
      });
    }

    // 4. Tạo Location
    let loc = await prisma.location.findFirst({
      where: { partnerId: profile.id, name: item.locName }
    });

    if (!loc) {
      loc = await prisma.location.create({
        data: {
          partnerId: profile.id,
          name: item.locName,
          address: item.address,
          ward: item.ward,
          district: item.district,
          city: item.city,
          latitude: item.lat,
          longitude: item.lng,
          contactPhone: item.phone,
          imageUrl: item.imageUrl,
          isActive: true,
          isPrimary: false
        }
      });
      console.log(`    -> Created location: ${item.locName}`);
    } else {
      loc = await prisma.location.update({
        where: { id: loc.id },
        data: {
          imageUrl: item.imageUrl,
          address: item.address,
          latitude: item.lat,
          longitude: item.lng,
          contactPhone: item.phone
        }
      });
      console.log(`    -> Updated location details/image: ${item.locName}`);
    }

    // 5. Liên kết tiện ích (Amenities)
    for (const amName of item.amenities) {
      const amId = amenityMap[amName];
      if (amId) {
        const link = await prisma.locationAmenity.findUnique({
          where: {
            locationId_amenityId: { locationId: loc.id, amenityId: amId }
          }
        });
        if (!link) {
          await prisma.locationAmenity.create({
            data: { locationId: loc.id, amenityId: amId }
          });
        }
      }
    }

    // 6. Tạo Nước uống & Sản phẩm bán kèm
    const defaultProducts = [
      { name: 'Nước khoáng Aquafina 500ml', price: 10000, category: 'DRINK' },
      { name: 'Nước tăng lực Revive 500ml', price: 15000, category: 'DRINK' },
      { name: 'Thuê vợt chuyên nghiệp', price: 30000, category: 'EQUIPMENT' },
      { name: 'Bóng / Cầu thi đấu thêm', price: 20000, category: 'EQUIPMENT' },
    ];

    for (const p of defaultProducts) {
      const dbProd = await prisma.product.findFirst({
        where: { locationId: loc.id, name: p.name }
      });
      if (!dbProd) {
        await prisma.product.create({
          data: {
            locationId: loc.id,
            name: p.name,
            price: p.price,
            category: p.category,
            isAvailable: true
          }
        });
      }
    }

    // 7. Tạo sân con (SportsPitches), TimeSlots, và Đánh giá (Reviews)
    for (const courtData of item.courts) {
      let svc = await prisma.sportsPitch.findFirst({
        where: { locationId: loc.id, name: courtData.name }
      });

      if (!svc) {
        svc = await prisma.sportsPitch.create({
          data: {
            locationId: loc.id,
            name: courtData.name,
            category: courtData.category,
            subType: courtData.subType,
            description: item.description,
            basePricePerHour: courtData.price,
            isActive: true,
            imageUrls: JSON.stringify([item.imageUrl])
          }
        });
      } else {
        svc = await prisma.sportsPitch.update({
          where: { id: svc.id },
          data: {
            imageUrls: JSON.stringify([item.imageUrl]),
            description: item.description,
            basePricePerHour: courtData.price
          }
        });
      }

      // 8. Tạo TimeSlots cho tất cả các ngày trong tuần (0-6)
      // Tạo các ca đấu cố định:
      // Ca 1: 06:00 - 08:00 (Hệ số 1.0)
      // Ca 2: 08:00 - 10:00 (Hệ số 1.0)
      // Ca 3: 15:00 - 17:00 (Hệ số 1.0)
      // Ca 4: 17:00 - 19:00 (Ca Vàng, Hệ số 1.25)
      // Ca 5: 19:00 - 21:00 (Ca Vàng, Hệ số 1.25)
      const slotTimes = [
        { start: '06:00', end: '08:00', mod: 1.00 },
        { start: '08:00', end: '10:00', mod: 1.00 },
        { start: '15:00', end: '17:00', mod: 1.00 },
        { start: '17:00', end: '19:00', mod: 1.25 },
        { start: '19:00', end: '21:00', mod: 1.25 },
      ];

      for (let day = 0; day <= 6; day++) {
        for (const slot of slotTimes) {
          const startTimeStr = `1970-01-01T${slot.start}:00.000Z`;
          const endTimeStr = `1970-01-01T${slot.end}:00.000Z`;

          const exists = await prisma.timeSlot.findUnique({
            where: {
              sportsPitchId_dayOfWeek_startTime: {
                sportsPitchId: svc.id,
                dayOfWeek: day,
                startTime: new Date(startTimeStr),
              }
            }
          });

          if (!exists) {
            await prisma.timeSlot.create({
              data: {
                sportsPitchId: svc.id,
                dayOfWeek: day,
                startTime: new Date(startTimeStr),
                endTime: new Date(endTimeStr),
                priceModifier: slot.mod,
                isAvailable: true
              }
            });
          }
        }
      }

      // 9. Thêm 1 Review mẫu từ Customer mặc định
      if (defaultCustomer) {
        const reviewExists = await prisma.review.findFirst({
          where: { sportsPitchId: svc.id, userId: defaultCustomer.id }
        });

        if (!reviewExists) {
          // Tạo một booking giả để thỏa mãn ràng buộc khóa ngoại độc nhất Booking
          const bookingCode = `BK${Math.floor(100000 + Math.random() * 900000)}`;
          const booking = await prisma.booking.create({
            data: {
              bookingCode,
              userId: defaultCustomer.id,
              sportsPitchId: svc.id,
              bookingDate: new Date(),
              startTime: new Date('1970-01-01T17:00:00.000Z'),
              endTime: new Date('1970-01-01T19:00:00.000Z'),
              basePrice: courtData.price,
              finalPrice: courtData.price * 2,
              status: 'CONFIRMED'
            }
          });

          await prisma.review.create({
            data: {
              bookingId: booking.id,
              userId: defaultCustomer.id,
              sportsPitchId: svc.id,
              rating: 5,
              comment: 'Sân đấu rất sạch sẽ, thảm lót êm ái chân. Dịch vụ nước giải khát lạnh tận răng, rất hài lòng!',
              partnerReply: 'Cảm ơn quý khách đã tin tưởng và ủng hộ hệ thống sân đấu của chúng tôi. Hẹn gặp lại bạn trong trận đấu tiếp theo!'
            }
          });
        }
      }
    }
  }

  console.log('  └─ ✅ Seeded 10 locations with sports pitches, slots, products and reviews successfully!');
}
