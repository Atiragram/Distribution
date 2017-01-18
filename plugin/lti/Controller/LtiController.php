<?php

namespace UJM\LtiBundle\Controller;

use Claroline\CoreBundle\Entity\Workspace\Workspace;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use JMS\DiExtraBundle\Annotation as DI;
use JMS\SecurityExtraBundle\Annotation as SEC;
use UJM\LtiBundle\Entity\LtiApp;
use UJM\LtiBundle\Form\AppType;

/**
 * @DI\Tag("security.secure_service")
 * @SEC\PreAuthorize("canOpenAdminTool('administration_tool_lti')")
 */
class LtiController extends Controller
{
    /**
     * @Route("/apps", name="ujm_admin_lti")
     * @Template
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function appAction(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $entity = new LtiApp();
        $form = $this->createForm(new AppType(), $entity);
        $vars['form'] = $form->createView();

        if ($request->isMethod('POST')) {
            $form->handleRequest($request);
            if ($form->isValid()) {
                $em->persist($entity);
                $em->flush();
            }
        }
        $apps = $em->getRepository('UJMLtiBundle:LtiApp')->findAll();
        $vars['apps'] = $apps;

        return $this->render('UJMLtiBundle:Lti:app.html.twig', $vars);
    }

    /**
     * @Route("/delete/app/{appId}", name="ujm_lti_delete_app")
     *
     * @param int appId
     * @Template
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction($appId)
    {
        $em = $this->getDoctrine()->getManager();
        $app = $em->getRepository('UJMLtiBundle:LtiApp')->find($appId);
        $em->remove($app);
        $em->flush();

        return $this->forward('UJMLtiBundle:Lti:app');
    }

    /**
     * @Route("/tool_apps/{workspace}", name="ujm_lti_tool_apps")
     *
     * @Template
     *
     * @param Workspace $workspace
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function tool_appsAction(Workspace $workspace)
    {
        $params['workspace'] = $workspace->getId();

        $subRequest = $this->request->duplicate([], null, $params);
        $response = $this->httpKernel->handle($subRequest, HttpKernelInterface::SUB_REQUEST);

        return $response;
    }
}
