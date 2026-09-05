<?php

namespace App\Repositories\Eloquent;

use App\Models\Department;
use Illuminate\Support\Collection;

/**
 * @extends BaseRepository<Department>
 */
class DepartmentRepository extends BaseRepository
{
    protected function model(): string
    {
        return Department::class;
    }

    /**
     * All departments with their faculty (for the master-data table).
     *
     * @return Collection<int, Department>
     */
    public function allWithFaculty(bool $withTrashed = false): Collection
    {
        return $this->query($withTrashed)
            ->with('faculty:id,name')
            ->orderBy('name')
            ->get();
    }

    /**
     * Active departments belonging to one faculty — powers the cascading
     * Faculty → Department select in the upload form.
     *
     * @return Collection<int, Department>
     */
    public function activeForFaculty(int $facultyId): Collection
    {
        return $this->query()
            ->where('faculty_id', $facultyId)
            ->where('status', true)
            ->orderBy('name')
            ->get();
    }
}
