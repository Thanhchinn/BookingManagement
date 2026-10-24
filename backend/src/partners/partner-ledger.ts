import { LedgerEntryType, Prisma } from '@prisma/client';

// Ghi một bút toán vào sổ cái hoa hồng và cập nhật số dư cache của đối tác + lưu số dư lũy kế (balanceAfter) trong cùng transaction.
// Số dư = tổng các bút toán (amount > 0: đối tác nợ thêm, amount < 0: giảm nợ).
export async function postLedgerEntry(
  tx: Prisma.TransactionClient,
  entry: {
    partnerId: bigint;
    type: LedgerEntryType;
    amount: Prisma.Decimal;
    bookingId?: bigint | null;
    billId?: bigint | null;
    note?: string | null;
    createdBy?: bigint | null;
  },
) {
  const updatedPartner = await tx.partnerProfile.update({
    where: { id: entry.partnerId },
    data: { balance: { increment: entry.amount } },
    select: { balance: true },
  });

  const created = await tx.partnerLedgerEntry.create({
    data: {
      partnerId: entry.partnerId,
      type: entry.type,
      amount: entry.amount,
      balanceAfter: updatedPartner.balance,
      bookingId: entry.bookingId ?? null,
      billId: entry.billId ?? null,
      note: entry.note ?? null,
      createdBy: entry.createdBy ?? null,
    },
  });

  return created;
}
