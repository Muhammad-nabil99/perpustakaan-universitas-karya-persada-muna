<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Concerns\HasTeams;
use App\Models\Collection as CollectionModel;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $role
 * @property bool $is_blocked
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property int|null $current_team_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Team|null $currentTeam
 * @property-read Collection<int, Team> $ownedTeams
 * @property-read Collection<int, Membership> $teamMemberships
 * @property-read Collection<int, Team> $teams
 */
#[Fillable(['name', 'email', 'password', 'current_team_id', 'role', 'is_blocked'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasTeams, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    public const ROLE_SUPER_ADMIN = 'super_admin';

    public const ROLE_PUBLISHER = 'publisher';

    public const ROLE_READER = 'reader';

    /**
     * All assignable roles, ordered least → most privileged. Used for the role
     * dropdown in user management and for validation.
     *
     * @var list<string>
     */
    public const ROLES = [
        self::ROLE_READER,
        self::ROLE_PUBLISHER,
        self::ROLE_SUPER_ADMIN,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_blocked' => 'boolean',
        ];
    }

    /**
     * Collections uploaded by this user (only meaningful for publishers).
     *
     * Aliased because `Collection` in this file already refers to Eloquent's
     * Collection class (used by the team relation PHPDoc above).
     *
     * @return HasMany<CollectionModel, $this>
     */
    public function collections(): HasMany
    {
        return $this->hasMany(CollectionModel::class, 'created_by');
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isPublisher(): bool
    {
        return $this->role === self::ROLE_PUBLISHER;
    }

    /**
     * Pembaca / mahasiswa umum — search, read and download only.
     */
    public function isReader(): bool
    {
        return $this->role === self::ROLE_READER;
    }

    /**
     * Whether this user may contribute collections. Readers may not; both
     * publishers (Mahasiswa Kontributor) and super admins may.
     */
    public function canContribute(): bool
    {
        return $this->isPublisher() || $this->isSuperAdmin();
    }
}
