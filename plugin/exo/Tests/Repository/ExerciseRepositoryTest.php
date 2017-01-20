<?php

namespace UJM\ExoBundle\Tests\Repository;

use Claroline\CoreBundle\Library\Testing\TransactionalTestCase;
use Claroline\CoreBundle\Persistence\ObjectManager;
use UJM\ExoBundle\Entity\Attempt\Paper;
use UJM\ExoBundle\Entity\Exercise;
use UJM\ExoBundle\Library\Testing\Persister;
use UJM\ExoBundle\Repository\ExerciseRepository;

class ExerciseRepositoryTest extends TransactionalTestCase
{
    /** @var ObjectManager */
    private $om;
    /** @var Persister */
    private $persist;
    /** @var ExerciseRepository */
    private $repo;
    /** @var Exercise[] */
    private $exercises = [];

    protected function setUp()
    {
        parent::setUp();

        $this->om = $this->client->getContainer()->get('claroline.persistence.object_manager');
        $this->persist = new Persister($this->om);
        $this->repo = $this->om->getRepository('UJMExoBundle:Exercise');

        // Initialize some base data for tests
        $paperGenerator = $this->client->getContainer()->get('ujm_exo.generator.paper');
        $exerciseWithPapers = $this->persist->exercise('Exercise 1', [], $this->persist->user('john'));

        $paper1 = $paperGenerator->create($exerciseWithPapers);
        $this->om->persist($paper1);

        $paper2 = $paperGenerator->create($exerciseWithPapers);
        $this->om->persist($paper2);

        $this->exercises = [
            $exerciseWithPapers,
        ];

        $this->om->flush();
    }

    public function testFindScores()
    {
        $this->markTestIncomplete(
            'This test has not been implemented yet.'
        );
    }

    public function testInvalidatePapers()
    {
        $this->repo->invalidatePapers($this->exercises[0]);
        $this->om->clear(); // this is needed to force doctrine to reload the entities

        $papers = $this->om->getRepository('UJMExoBundle:Attempt\Paper')->findBy([
            'exercise' => $this->exercises[0],
        ]);

        /** @var Paper $paper */
        foreach ($papers as $paper) {
            $this->assertTrue($paper->isInvalidated());
        }
    }
}
