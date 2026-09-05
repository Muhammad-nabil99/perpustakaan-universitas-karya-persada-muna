<?php

namespace Database\Seeders;

use App\Models\AccessLog;
use App\Models\Collection;
use App\Models\CollectionCategory;
use App\Models\CollectionType;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Language;
use App\Models\Publisher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * NOTE: model events stay ON — HasSlug generates slugs on `creating`.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(MasterDataSeeder::class);

        // --- Users ------------------------------------------------------------
        User::factory()->create([
            'name' => 'Muhammad Nabil',
            'email' => 'admin@example.com',
            'role' => User::ROLE_SUPER_ADMIN,
        ]);

        $mainPublisher = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => User::ROLE_PUBLISHER,
        ]);

        $publishers = User::factory(3)
            ->create(['role' => User::ROLE_PUBLISHER])
            ->push($mainPublisher);

        // Pembaca / mahasiswa umum — search, read and download only.
        User::factory()->create([
            'name' => 'Mahasiswa Pembaca',
            'email' => 'pembaca@example.com',
            'role' => User::ROLE_READER,
        ]);

        // --- Reference master data -------------------------------------------
        $bookType = CollectionType::where('slug', 'e-book')->firstOrFail();
        $thesisType = CollectionType::where('slug', 'skripsi')->firstOrFail();
        $journalType = CollectionType::where('slug', 'jurnal')->firstOrFail();

        $umumCategories = CollectionCategory::whereHas('parent', fn ($q) => $q->where('slug', 'umum'))->get();
        // The nine Bahan Pustaka categories are faculty-flagged roots.
        $facultyCategories = CollectionCategory::where('requires_faculty', true)
            ->where('name', 'like', 'Bahan Pustaka%')
            ->get();

        $faculties = Faculty::with('departments')->get();
        $languages = Language::all();
        $publisherOrgs = Publisher::all();

        // --- Collections ------------------------------------------------------
        // A mix of Books (publisher + ISBN) and Theses (faculty + department),
        // exercising both branches of the dynamic form behaviour.
        $books = [
            'Introduction to Artificial Intelligence',
            'Database Systems: Concepts & Design',
            'Web Programming with Modern JavaScript',
            'Clean Architecture',
            'Operating System Concepts',
        ];

        $theses = [
            'Analisis Sistem Informasi Perpustakaan Berbasis Web',
            'Pengaruh Media Pembelajaran Digital terhadap Hasil Belajar',
            'Implementasi Machine Learning untuk Prediksi Kelulusan',
        ];

        $journals = [
            'Jurnal Teknologi Informasi Vol. 12',
            'Jurnal Kesehatan Masyarakat Vol. 8',
        ];

        $created = collect();

        foreach ($books as $i => $title) {
            $created->push(Collection::create([
                'created_by' => $publishers->random()->id,
                'collection_type_id' => $bookType->id,
                'collection_category_id' => $umumCategories->random()->id,
                'language_id' => $languages->random()->id,
                'publisher_id' => $publisherOrgs->random()->id,
                'title' => $title,
                'author' => fake()->name(),
                'isbn' => fake()->isbn13(),
                'published_date' => fake()->dateTimeBetween('-4 years', 'now')->format('Y-m-d'),
                'description' => fake()->paragraphs(2, true),
                'keywords' => 'teknologi, komputer, informatika',
                'pages' => random_int(120, 480),
                'file_size' => random_int(500_000, 8_000_000),
                'status' => $i < 3 ? Collection::STATUS_PUBLISHED : Collection::STATUS_DRAFT,
                'featured' => $i < 2,
                'read_count' => random_int(150, 900),
                'download_count' => random_int(80, 600),
                'visitor_count' => random_int(200, 1200),
            ]));
        }

        foreach ($theses as $i => $title) {
            $faculty = $faculties->random();

            $created->push(Collection::create([
                'created_by' => $publishers->random()->id,
                'collection_type_id' => $thesisType->id,
                'collection_category_id' => $facultyCategories->random()->id,
                'faculty_id' => $faculty->id,
                'department_id' => $faculty->departments->random()->id,
                'language_id' => $languages->firstWhere('code', 'id')->id,
                // No publisher / ISBN — a Thesis hides those fields.
                'title' => $title,
                'author' => fake()->name(),
                'published_date' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
                'description' => fake()->paragraphs(2, true),
                'keywords' => 'skripsi, penelitian',
                'pages' => random_int(60, 150),
                'file_size' => random_int(400_000, 3_000_000),
                'status' => $i < 2 ? Collection::STATUS_PUBLISHED : Collection::STATUS_DRAFT,
                'read_count' => random_int(50, 400),
                'download_count' => random_int(20, 200),
                'visitor_count' => random_int(80, 500),
            ]));
        }

        foreach ($journals as $title) {
            $created->push(Collection::create([
                'created_by' => $publishers->random()->id,
                'collection_type_id' => $journalType->id,
                'collection_category_id' => CollectionCategory::where('slug', 'penelitian')->first()?->id,
                'language_id' => $languages->random()->id,
                'publisher_id' => $publisherOrgs->random()->id,
                'title' => $title,
                'author' => fake()->name(),
                'published_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
                'description' => fake()->paragraph(),
                'keywords' => 'jurnal, riset',
                'pages' => random_int(30, 90),
                'file_size' => random_int(300_000, 2_000_000),
                'status' => Collection::STATUS_PUBLISHED,
                'read_count' => random_int(60, 350),
                'download_count' => random_int(30, 180),
                'visitor_count' => random_int(90, 450),
            ]));
        }

        // --- Access logs across the last 7 days --------------------------------
        $actions = [AccessLog::ACTION_READ, AccessLog::ACTION_DOWNLOAD, AccessLog::ACTION_VISIT];

        foreach ($created as $collection) {
            foreach (range(1, random_int(8, 20)) as $ignored) {
                AccessLog::create([
                    'collection_id' => $collection->id,
                    'user_id' => random_int(0, 1) ? $publishers->random()->id : null,
                    'action' => $actions[array_rand($actions)],
                    'ip_address' => fake()->ipv4(),
                    'created_at' => Carbon::now()
                        ->subDays(random_int(0, 6))
                        ->subHours(random_int(0, 23)),
                ]);
            }
        }
    }
}
