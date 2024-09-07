import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserAndRefreshTokenTables1725725058383
    implements MigrationInterface
{
    name = 'RenameUserAndRefreshTokenTables1725725058383';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`,
        );
        await queryRunner.renameTable('user', 'users');
        await queryRunner.renameTable('refresh_token', 'refresh_tokens');
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
        );
        await queryRunner.renameTable('users', 'user');
        await queryRunner.renameTable('refresh_tokens', 'refresh_token');
        await queryRunner.query(
            `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}
