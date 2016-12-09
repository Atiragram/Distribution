<?php

namespace UJM\ExoBundle\Library\Question\Definition;

use UJM\ExoBundle\Entity\QuestionType\AbstractQuestion;
use UJM\ExoBundle\Library\Serializer\SerializerInterface;
use UJM\ExoBundle\Library\Validator\ValidatorInterface;

/**
 * Base class for question definitions.
 * Permits to use separate classes to handle Serialization and Validation.
 */
abstract class AbstractDefinition implements QuestionDefinitionInterface
{
    /**
     * Gets the question Validator instance.
     *
     * @return ValidatorInterface
     */
    abstract protected function getQuestionValidator();

    /**
     * Gets the question Serializer instance.
     *
     * @return SerializerInterface
     */
    abstract protected function getQuestionSerializer();

    /**
     * Validates a choice question.
     *
     * @param \stdClass $question
     * @param array     $options
     *
     * @return array
     */
    public function validateQuestion(\stdClass $question, array $options = [])
    {
        return $this->getQuestionValidator()->validate($question, $options);
    }

    /**
     * Serializes a question entity.
     *
     * @param AbstractQuestion $question
     * @param array            $options
     *
     * @return \stdClass
     */
    public function serializeQuestion(AbstractQuestion $question, array $options = [])
    {
        return $this->getQuestionSerializer()->serialize($question, $options);
    }

    /**
     * Deserializes question data.
     *
     * @param \stdClass        $questionData
     * @param AbstractQuestion $question
     * @param array            $options
     *
     * @return AbstractQuestion
     */
    public function deserializeQuestion(\stdClass $questionData, AbstractQuestion $question = null, array $options = [])
    {
        return $this->getQuestionSerializer()->deserialize($questionData, $question, $options);
    }

    public function validateAnswer(\stdClass $question, $answer, array $options = [])
    {
    }

    public function calculateScore(AbstractQuestion $question, $answer)
    {
        // TODO: Implement calculateScore() method.
    }
}
