<?php

namespace Database\Seeders;

use App\Models\CollectionCategory;
use App\Models\CollectionType;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Language;
use App\Models\Publisher;
use Illuminate\Database\Seeder;

/**
 * Seeds the dynamic master data. Everything here is admin-editable at runtime —
 * these rows are just a sensible starting point, not hardcoded behaviour.
 *
 * NOTE: model events must stay ON here — the HasSlug trait generates slugs on
 * the `creating` event, so WithoutModelEvents would break slug generation.
 */
class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // --- Collection types ------------------------------------------------
        // requires_publisher / requires_isbn drive the dynamic upload form.
        // E-Book / Jurnal / Prosiding are the three document types a contributor
        // picks on the upload form; the rest remain available for admin use.
        $types = [
            ['name' => 'E-Book', 'requires_publisher' => true, 'requires_isbn' => true],
            ['name' => 'Jurnal', 'requires_publisher' => true, 'requires_isbn' => false],
            ['name' => 'Prosiding', 'requires_publisher' => true, 'requires_isbn' => false],
            ['name' => 'Buku', 'requires_publisher' => true, 'requires_isbn' => true],
            ['name' => 'Skripsi', 'requires_publisher' => false, 'requires_isbn' => false],
            ['name' => 'Modul', 'requires_publisher' => false, 'requires_isbn' => false],
            ['name' => 'Laporan Penelitian', 'requires_publisher' => false, 'requires_isbn' => false],
        ];

        foreach ($types as $type) {
            CollectionType::create($type);
        }

        // --- Categories (hierarchical) ---------------------------------------
        $umum = CollectionCategory::create(['name' => 'Umum']);
        foreach (['Komputer', 'Bahasa', 'Ekonomi'] as $child) {
            CollectionCategory::create(['name' => $child, 'parent_id' => $umum->id]);
        }

        // The Fakultas branch is flagged: choosing it reveals Faculty → Department.
        $fakultas = CollectionCategory::create([
            'name' => 'Fakultas',
            'requires_faculty' => true,
        ]);

        foreach (['Ilmu Kesehatan', 'Hukum', 'Pendidikan'] as $child) {
            CollectionCategory::create([
                'name' => $child,
                'parent_id' => $fakultas->id,
                'requires_faculty' => true,
            ]);
        }

        foreach (['Penelitian', 'Repository', 'Arsip'] as $root) {
            CollectionCategory::create(['name' => $root]);
        }

        // --- Bahan Pustaka (per program studi) --------------------------------
        // The nine main categories contributors upload into. Each represents a
        // program studi, so choosing one reveals Fakultas → Program Studi in the
        // upload form. The document type (E-Book / Jurnal / Prosiding) is a
        // separate axis, held in collection_types above.
        foreach ([
            'Bahan Pustaka Administrasi Kesehatan',
            'Bahan Pustaka Administrasi Rumah Sakit',
            'Bahan Pustaka Hukum',
            'Bahan Pustaka K3',
            'Bahan Pustaka Kebidanan',
            'Bahan Pustaka Keperawatan',
            'Bahan Pustaka Manajemen',
            'Bahan Pustaka Pendidikan IPA',
            'Bahan Pustaka Promkes',
        ] as $bahanPustaka) {
            CollectionCategory::create([
                'name' => $bahanPustaka,
                'requires_faculty' => true,
            ]);
        }

        // --- Faculties + departments -----------------------------------------
        // Mirrors the nine Bahan Pustaka categories so every category has a
        // matching program studi to select underneath it.
        $faculties = [
            ['name' => 'Fakultas Ilmu Kesehatan', 'code' => 'FIKES', 'departments' => [
                ['name' => 'Administrasi Kesehatan', 'accreditation' => 'B'],
                ['name' => 'Administrasi Rumah Sakit', 'accreditation' => 'B'],
                ['name' => 'Keselamatan dan Kesehatan Kerja (K3)', 'accreditation' => 'B'],
                ['name' => 'Kebidanan', 'accreditation' => 'C'],
                ['name' => 'Keperawatan', 'accreditation' => 'B'],
                ['name' => 'Promosi Kesehatan', 'accreditation' => 'B'],
            ]],
            ['name' => 'Fakultas Hukum', 'code' => 'FH', 'departments' => [
                ['name' => 'Ilmu Hukum', 'accreditation' => 'A'],
            ]],
            ['name' => 'Fakultas Ekonomi dan Bisnis', 'code' => 'FEB', 'departments' => [
                ['name' => 'Manajemen', 'accreditation' => 'B'],
            ]],
            ['name' => 'Fakultas Keguruan dan Ilmu Pendidikan', 'code' => 'FKIP', 'departments' => [
                ['name' => 'Pendidikan IPA', 'accreditation' => 'B'],
            ]],
        ];

        foreach ($faculties as $data) {
            $faculty = Faculty::create([
                'name' => $data['name'],
                'code' => $data['code'],
            ]);

            foreach ($data['departments'] as $dept) {
                Department::create([...$dept, 'faculty_id' => $faculty->id]);
            }
        }

        // --- Languages --------------------------------------------------------
        foreach ([
            ['name' => 'Indonesia', 'code' => 'id'],
            ['name' => 'Inggris', 'code' => 'en'],
            ['name' => 'Arab', 'code' => 'ar'],
        ] as $language) {
            Language::create($language);
        }

        // --- Publishers -------------------------------------------------------
        foreach ([
            ['name' => 'Penerbit UKPM', 'address' => 'Raha, Muna'],
            ['name' => 'Gramedia Pustaka Utama', 'address' => 'Jakarta'],
            ['name' => 'Erlangga', 'address' => 'Jakarta'],
        ] as $publisher) {
            Publisher::create($publisher);
        }
    }
}
