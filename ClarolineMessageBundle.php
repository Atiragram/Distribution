<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\MessageBundle;

use Claroline\CoreBundle\Library\PluginBundle;

class ClarolineMessageBundle extends PluginBundle
{
    public function hasMigrations()
    {
        return false;
    }

    public function getRequiredFixturesDirectory($environment)
    {
        return 'DataFixtures';
    }
}
