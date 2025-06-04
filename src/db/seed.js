// src/db/seed.js
const {
  EmployeeWorkSchedule,
  Position,
  Attendance,
  Employee,
  SpecialAllowance,
  Payroll
} = require('../models');

async function seedDatabase() {
  try {
    // ສ້າງຕາລາງວຽກ
    const schedules = await EmployeeWorkSchedule.bulkCreate([
      { shift_start: '08:00:00', shift_end: '17:00:00' },
      { shift_start: '17:00:00', shift_end: '02:00:00' }
    ]);

    // ສ້າງຕຳແໜ່ງ
    const positions = await Position.bulkCreate([
      { position_name: 'ຜູ້ຈັດການ', salary_rate: 2000000, ot_rate: 15000 },
      { position_name: 'ພະນັກງານຝ່າຍຂາຍ', salary_rate: 1500000, ot_rate: 12000 }
    ]);

    // ສ້າງຂໍ້ມູນການລົງເວລາ (ໃຫ້ສ້າງກ່ອນ Employee ເພື່ອໃຫ້ໄດ້ attendance_id)
    const attendances = await Attendance.bulkCreate([
      {
        employee_id: 1, // ຈະອັບເດດຫຼັງຈາກສ້າງ Employee
        check_in_time: '08:05:00',
        check_out_time: '17:10:00',
        date: '2023-05-01',
        status: 1.00
      },
      {
        employee_id: 2, // ຈະອັບເດດຫຼັງຈາກສ້າງ Employee
        check_in_time: '17:02:00',
        check_out_time: '02:05:00',
        date: '2023-05-01',
        status: 1.00
      }
    ]);

    // ສ້າງພະນັກງານ
    const employees = await Employee.bulkCreate([
      {
        name: 'ທ້າວ ສົມໄຊ ສົມບັດ',
        gender: 'ຊາຍ',
        birthdate: '1990-05-15',
        address: 'ບ້ານ ໂນນສະຫວ່າງ, ເມືອງ ໄຊທານີ, ນະຄອນຫລວງວຽງຈັນ',
        phone: '0201234567',
        schedule_id: schedules[0].schedule_id,
        attendance_id: attendances[0].attendance_id,
        position_id: positions[0].position_id
      },
      {
        name: 'ນາງ ມະນີຈັນ ສີສົມບັດ',
        gender: 'ຍິງ',
        birthdate: '1995-10-20',
        address: 'ບ້ານ ໂພນຕ້ອງ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫລວງວຽງຈັນ',
        phone: '0209876543',
        schedule_id: schedules[1].schedule_id,
        attendance_id: attendances[1].attendance_id,
        position_id: positions[1].position_id
      }
    ]);

    // ອັບເດດ employee_id ໃນຕາຕະລາງ Attendance
    await attendances[0].update({ employee_id: employees[0].employee_id });
    await attendances[1].update({ employee_id: employees[1].employee_id });

    // ສ້າງຂໍ້ມູນເງິນພິເສດ
    await SpecialAllowance.bulkCreate([
      {
        employee_id: employees[0].employee_id,
        amount: 100000,
        food_money: 50000
      },
      {
        employee_id: employees[1].employee_id,
        amount: 80000,
        food_money: 50000
      }
    ]);

    // ສ້າງຂໍ້ມູນການເບີກຈ່າຍເງິນເດືອນ
    await Payroll.bulkCreate([
      {
        employee_id: employees[0].employee_id,
        amount: 2150000,
        social_date: 30000,
        tax: 20000,
        payment_date: '2023-05-25',
        base_salary: 2000000,
        hard_work_money: 150000
      },
      {
        employee_id: employees[1].employee_id,
        amount: 1630000,
        social_date: 20000,
        tax: 15000,
        payment_date: '2023-05-25',
        base_salary: 1500000,
        hard_work_money: 130000
      }
    ]);

    console.log('ຂໍ້ມູນເລີ່ມຕົ້ນຖືກເພີ່ມລົງຖານຂໍ້ມູນສຳເລັດແລ້ວ');
  } catch (error) {
    console.error('ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນເລີ່ມຕົ້ນ:', error);
  }
}

module.exports = seedDatabase;